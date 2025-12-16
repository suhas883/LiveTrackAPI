import type { TrackingEvent } from "@shared/schema";

interface ParsedTrackingInfo {
  courier: string | null;
  courierCode: string | null;
  status: string;
  statusDescription: string | null;
  origin: any | null;
  destination: any | null;
  estimatedDelivery: string | null;
  lastUpdate: string | null;
  events: TrackingEvent[];
  rawResponse: string;
  trackingUrl: string | null;
  aiPrediction: any | null;
  weatherImpact: any | null;
  delayRisk: any | null;
  recommendations: string[];
  confidence: number;
  notFound: boolean;
}

const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

// Fetch tracking data directly from Ship24
async function fetchShip24Data(trackingNumber: string): Promise<string | null> {
  try {
    const url = `https://www.ship24.com/tracking?p=${trackingNumber}`;
    console.log(`[Ship24] Fetching: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0'
      }
    });
    
    if (!response.ok) {
      console.log(`[Ship24] Error: ${response.status}`);
      return null;
    }
    
    const html = await response.text();
    console.log(`[Ship24] Received ${html.length} chars`);
    return html;
  } catch (error) {
    console.error('[Ship24] Fetch error:', error);
    return null;
  }
}

// Parse Ship24 HTML for tracking data
function parseShip24Html(html: string): any {
  const events: any[] = [];
  let status = "unknown";
  let carrier = "Unknown";
  let deliveredDate = null;
  
  // Check for "Delivered" status
  if (html.includes('Delivered')) {
    status = "delivered";
  } else if (html.includes('In Transit')) {
    status = "in_transit";
  } else if (html.includes('Out for Delivery')) {
    status = "out_for_delivery";
  } else if (html.includes('At Destination')) {
    status = "at_destination";
  } else if (html.includes('Accepted')) {
    status = "pending";
  }
  
  // Extract carrier (look for DTDC, FedEx, etc.)
  const carrierMatch = html.match(/Handled by[\s\S]*?(DTDC|FedEx|UPS|USPS|DHL|Delhivery|India Post|Blue Dart)/i);
  if (carrierMatch) {
    carrier = carrierMatch[1];
  }
  
  // Extract delivery date
  const deliveredMatch = html.match(/Delivered on ([^<\n]+)/);
  if (deliveredMatch) {
    deliveredDate = deliveredMatch[1].trim();
  }
  
  // Extract events - look for date/time patterns with status and location
  const eventPattern = /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+([A-Za-z]+\s+\d+,\s+\d{4})\s+at\s+(\d{1,2}:\d{2}\s*[AP]M)[\s\S]*?(DTDC|FedEx|UPS|USPS|DHL)[\s\S]*?(Delivered|In Transit|At Destination|Accepted|Softdata Upload|Out for Delivery|Picked Up|Departed|Arrived)[\s\S]*?([A-Z]{2,}[A-Z\s]*?)(?=Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|$|Handled by)/gi;
  
  let match;
  const seenEvents = new Set();
  
  // Simple line-by-line parsing
  const lines = html.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for date patterns
    const dateMatch = line.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+([A-Za-z]+\s+\d+,\s+\d{4})\s+at\s+(\d{1,2}:\d{2}\s*[AP]M)/i);
    if (dateMatch) {
      const dateStr = dateMatch[2];
      const timeStr = dateMatch[3];
      
      // Look for status and location in next few lines
      let statusText = "";
      let location = "";
      
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const nextLine = lines[j].trim();
        if (nextLine.match(/Delivered|In Transit|At Destination|Accepted|Softdata Upload|Out for Delivery|Picked Up/i)) {
          statusText = nextLine;
        }
        if (nextLine.match(/^[A-Z]{3,}$/)) {
          location = nextLine;
        }
      }
      
      const eventKey = `${dateStr}-${timeStr}-${statusText}`;
      if (!seenEvents.has(eventKey) && statusText) {
        seenEvents.add(eventKey);
        events.push({
          date: dateStr,
          time: timeStr,
          timestamp: `${dateStr} ${timeStr}`,
          status: statusText,
          description: statusText,
          location: location
        });
      }
    }
  }
  
  return {
    status,
    carrier,
    deliveredDate,
    events: events.reverse(), // Chronological order
    found: events.length > 0 || status !== "unknown"
  };
}

export async function trackPackageWithPerplexity(trackingNumber: string, carrier?: string): Promise<ParsedTrackingInfo> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    throw new Error("PERPLEXITY_API_KEY is not configured");
  }

  const detectedCarrier = carrier || detectCarrierFromNumber(trackingNumber);
  const today = new Date().toISOString().split('T')[0];

  const trackingPrompt = `Track ${detectedCarrier} courier shipment ${trackingNumber}

What is the current delivery status of ${trackingNumber}? Where is the package now? Give me the complete tracking history with all scan events, dates, times and locations.

After finding the tracking information, return it as JSON:

Return this exact JSON structure:
{
  "carrier": "${detectedCarrier}",
  "notFound": true or false,
  "status": "not_found" | "pending" | "in_transit" | "out_for_delivery" | "delivered" | "exception",
  "estimatedDelivery": "date or null",
  "lastUpdated": "timestamp or null",
  "currentLocation": {"city": "", "state": "", "country": ""},
  "origin": {"city": "", "state": "", "country": ""},
  "destination": {"city": "", "state": "", "country": ""},
  "events": [
    {
      "date": "YYYY-MM-DD",
      "time": "HH:MM",
      "timestamp": "ISO string",
      "status": "event status",
      "description": "description",
      "location": {"city": "", "state": "", "country": ""}
    }
  ],
  "aiPrediction": {
    "prediction": "your analysis",
    "confidence": 50-95,
    "reasoning": "explanation"
  },
  "recommendations": ["tip1", "tip2"]
}

If NOT FOUND:
{
  "carrier": "${detectedCarrier}",
  "notFound": true,
  "status": "not_found",
  "events": [],
  "aiPrediction": {
    "prediction": "Tracking number not found in ${detectedCarrier} system.",
    "confidence": 90,
    "reasoning": "No shipment record found"
  },
  "recommendations": ["Verify tracking number", "Contact sender"]
}`;

  try {
    // First, try to fetch directly from Ship24
    console.log(`[Ship24] Attempting direct fetch for: ${trackingNumber}`);
    const ship24Html = await fetchShip24Data(trackingNumber);
    
    if (ship24Html) {
      const ship24Data = parseShip24Html(ship24Html);
      console.log(`[Ship24] Parsed - found: ${ship24Data.found}, status: ${ship24Data.status}, events: ${ship24Data.events.length}`);
      
      if (ship24Data.found && ship24Data.events.length > 0) {
        // We got real tracking data from Ship24!
        console.log(`[Ship24] SUCCESS! Found ${ship24Data.events.length} tracking events`);
        
        const statusMap: Record<string, string> = {
          'delivered': 'Delivered',
          'in_transit': 'In Transit',
          'out_for_delivery': 'Out for Delivery',
          'at_destination': 'At Destination',
          'pending': 'Pending',
          'unknown': 'Unknown'
        };
        
        return {
          courier: ship24Data.carrier || detectedCarrier,
          courierCode: (ship24Data.carrier || detectedCarrier).toLowerCase().replace(/\s+/g, '_'),
          status: statusMap[ship24Data.status] || ship24Data.status,
          statusDescription: ship24Data.deliveredDate ? `Delivered: ${ship24Data.deliveredDate}` : null,
          origin: ship24Data.events[0]?.location ? { city: ship24Data.events[0].location, state: "", country: "India" } : null,
          destination: ship24Data.events[ship24Data.events.length - 1]?.location ? { city: ship24Data.events[ship24Data.events.length - 1].location, state: "", country: "India" } : null,
          estimatedDelivery: ship24Data.deliveredDate || null,
          lastUpdate: ship24Data.events[ship24Data.events.length - 1]?.timestamp || null,
          events: ship24Data.events.map((e: any) => ({
            date: e.date,
            time: e.time,
            timestamp: e.timestamp,
            location: e.location,
            city: e.location,
            state: "",
            country: "India",
            status: e.status,
            description: e.description
          })),
          rawResponse: "Data from Ship24",
          trackingUrl: `https://www.ship24.com/tracking?p=${trackingNumber}`,
          aiPrediction: {
            prediction: ship24Data.status === 'delivered' 
              ? `Your package was delivered on ${ship24Data.deliveredDate}` 
              : `Your package is ${ship24Data.status.replace('_', ' ')}`,
            confidence: 95,
            reasoning: `Live tracking data retrieved from Ship24 showing ${ship24Data.events.length} tracking events.`
          },
          weatherImpact: null,
          delayRisk: null,
          recommendations: ship24Data.status === 'delivered' 
            ? ["Package has been delivered", "Contact recipient to confirm receipt"]
            : ["Track your package for updates", "Contact carrier for more information"],
          confidence: 95,
          notFound: false
        };
      }
    }
    
    // If Ship24 didn't have data, fall back to Perplexity
    console.log(`[Perplexity Sonar Pro] Ship24 had no data, searching web for: ${trackingNumber}`);
    
    // Use sonar-pro model with web grounding (search enabled by default)
    const response = await fetch(PERPLEXITY_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          {
            role: "system",
            content: `You are a real-time package tracking assistant. Today is ${today}. Search the web for CURRENT, LIVE tracking information. Always respond with valid JSON only. Include the most recent tracking events. If no current data found, return JSON with notFound: true.`
          },
          {
            role: "user",
            content: trackingPrompt
          }
        ],
        temperature: 0.1,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Perplexity API error:", response.status, errorText);
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    // Handle non-streaming JSON response
    const data = await response.json();
    const fullContent = data.choices?.[0]?.message?.content || "";
    const citations: string[] = data.citations || [];

    console.log(`[Perplexity] Received ${fullContent.length} chars, ${citations.length} citations`);
    if (citations.length > 0) {
      console.log(`[Perplexity] Citations: ${citations.slice(0, 3).join(', ')}...`);
    }
    
    // Log first 500 chars of response for debugging
    console.log(`[Perplexity] Response preview: ${fullContent.substring(0, 500)}`);

    // Extract JSON from response - try multiple patterns
    let jsonMatch = fullContent.match(/```json\s*([\s\S]*?)```/);
    let jsonStr = jsonMatch ? jsonMatch[1] : null;
    
    if (!jsonStr) {
      // Try finding raw JSON object
      jsonMatch = fullContent.match(/\{[\s\S]*\}/);
      jsonStr = jsonMatch ? jsonMatch[0] : null;
    }
    
    if (jsonStr) {
      try {
        // Clean up the JSON string
        jsonStr = jsonStr.trim();
        const trackingData = JSON.parse(jsonStr);
        console.log(`[Perplexity] JSON parsed successfully`);
        const hasRealEvents = trackingData.events && trackingData.events.length > 0;
        const isNotFound = trackingData.notFound === true || trackingData.status === "not_found";
        const dataFound = !isNotFound && (hasRealEvents || trackingData.status !== "not_found");
        
        console.log(`[Perplexity] Parsed - notFound: ${isNotFound}, events: ${trackingData.events?.length || 0}, status: ${trackingData.status}`);
        
        // Format events with full location details
        const formattedEvents = (trackingData.events || []).map((e: any) => {
          let locationString = "";
          if (typeof e.location === "object" && e.location) {
            const parts = [e.location.city, e.location.state, e.location.country].filter(Boolean);
            locationString = parts.join(", ");
          } else if (typeof e.location === "string") {
            locationString = e.location;
          }
          
          return {
            date: e.date || "",
            time: e.time || "",
            timestamp: e.timestamp || e.date || "",
            location: locationString,
            city: e.location?.city || "",
            state: e.location?.state || "",
            country: e.location?.country || "",
            status: e.status || "",
            description: e.description || e.status || ""
          };
        });

        // Format origin/destination
        const formatLocation = (loc: any) => {
          if (!loc) return null;
          if (typeof loc === "string") return { city: loc, state: "", country: "" };
          return {
            city: loc.city || "",
            state: loc.state || "",
            country: loc.country || ""
          };
        };

        return {
          courier: trackingData.carrier || detectedCarrier,
          courierCode: (trackingData.carrier || detectedCarrier)?.toLowerCase().replace(/\s+/g, "_") || null,
          status: isNotFound ? "not_found" : normalizeStatus(trackingData.status),
          statusDescription: trackingData.currentLocation?.city 
            ? `${trackingData.currentLocation.city}, ${trackingData.currentLocation.country}`
            : null,
          origin: formatLocation(trackingData.origin),
          destination: formatLocation(trackingData.destination),
          estimatedDelivery: dataFound ? trackingData.estimatedDelivery : null,
          lastUpdate: dataFound ? (trackingData.lastUpdated || new Date().toISOString()) : null,
          events: formattedEvents,
          rawResponse: fullContent,
          trackingUrl: getTrackingUrl(trackingData.carrier || detectedCarrier, trackingNumber),
          aiPrediction: trackingData.aiPrediction || {
            prediction: isNotFound 
              ? `Tracking number ${trackingNumber} was not found in ${detectedCarrier} system.`
              : dataFound 
                ? "Package is being tracked" 
                : "Awaiting tracking data",
            confidence: isNotFound ? 90 : (dataFound ? 80 : 50),
            reasoning: isNotFound
              ? "No shipment record exists for this tracking number"
              : dataFound 
                ? "Based on carrier tracking data" 
                : "No tracking events found yet"
          },
          weatherImpact: null,
          delayRisk: dataFound && hasRealEvents 
            ? (trackingData.delayRisk || { level: "low", score: 10, explanation: "Package moving normally" })
            : null,
          recommendations: trackingData.recommendations || (isNotFound
            ? [
                "Double-check the tracking number for typos",
                "Contact the sender to verify the tracking number",
                "Make sure the package has been shipped and scanned"
              ]
            : [
                "Check back in 24-48 hours for updates",
                "Contact the sender if no updates appear"
              ]),
          confidence: isNotFound ? 90 : (dataFound ? (trackingData.aiPrediction?.confidence || 80) : 50),
          notFound: isNotFound
        };
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        console.error("Failed to parse:", jsonMatch[0].substring(0, 300));
      }
    }

    // Fallback if JSON parsing fails
    console.log(`[Perplexity] JSON parsing failed, using fallback`);
    return {
      courier: detectedCarrier,
      courierCode: detectedCarrier?.toLowerCase().replace(/\s+/g, "_") || null,
      status: "pending",
      statusDescription: "Unable to parse tracking response",
      origin: null,
      destination: null,
      estimatedDelivery: null,
      lastUpdate: new Date().toISOString(),
      events: [],
      rawResponse: fullContent,
      trackingUrl: getTrackingUrl(detectedCarrier, trackingNumber),
      aiPrediction: {
        prediction: `Searching for tracking data for ${trackingNumber}. Please try again.`,
        confidence: 50,
        reasoning: "Temporary parsing issue"
      },
      weatherImpact: null,
      delayRisk: null,
      recommendations: [
        "Try tracking again in a few minutes",
        "Check the carrier website directly"
      ],
      confidence: 50,
      notFound: false
    };

  } catch (error) {
    console.error("Error calling Perplexity API:", error);
    
    return {
      courier: detectedCarrier,
      courierCode: detectedCarrier?.toLowerCase().replace(/\s+/g, "_") || null,
      status: "error",
      statusDescription: "Unable to retrieve tracking at this time",
      origin: null,
      destination: null,
      estimatedDelivery: null,
      lastUpdate: new Date().toISOString(),
      events: [],
      rawResponse: error instanceof Error ? error.message : "Unknown error",
      trackingUrl: getTrackingUrl(detectedCarrier, trackingNumber),
      aiPrediction: {
        prediction: "Unable to retrieve tracking information. Please try again.",
        confidence: 30,
        reasoning: "Temporary service issue"
      },
      weatherImpact: null,
      delayRisk: null,
      recommendations: ["Try again in a few minutes", "Check the carrier website directly"],
      confidence: 30,
      notFound: false
    };
  }
}

function detectCarrierFromNumber(trackingNumber: string): string {
  const num = trackingNumber.trim().toUpperCase();
  
  // Indian carriers
  if (/^D\d{8,}$/i.test(num)) return "DTDC";
  if (/^\d{13,14}$/.test(num) && num.length >= 13) return "Delhivery";
  if (/^\d{9}$/.test(num) || /^\d{11}$/.test(num)) return "Blue Dart";
  if (/^E[A-Z]\d{9}IN$/i.test(num) || /^R[A-Z]\d{9}IN$/i.test(num)) return "India Post";
  if (/^FMPP\d+$/i.test(num) || /^OD\d+$/i.test(num)) return "Ekart";
  if (/^XB\d+$/i.test(num)) return "Xpressbees";
  if (/^SF[A-Z0-9]+$/i.test(num) && num.startsWith("SF")) return "Shadowfax";
  
  // US carriers  
  if (/^1Z[A-Z0-9]{16}$/i.test(num)) return "UPS";
  if (/^\d{12}$/.test(num) || /^\d{15}$/.test(num) || /^\d{20}$/.test(num)) return "FedEx";
  if (/^(94|93|92|91|90)\d{18,20}$/.test(num) || /^\d{20,22}$/.test(num)) return "USPS";
  if (/^TBA\d{12,}$/i.test(num)) return "Amazon";
  
  // Global carriers
  if (/^\d{10}$/.test(num)) return "DHL";
  if (/^[A-Z]{2}\d{9}[A-Z]{2}$/i.test(num)) return "International Post";
  if (/^LP\d{14,}$/i.test(num)) return "Cainiao";
  if (/^YT\d{13,}$/i.test(num)) return "YTO Express";
  if (/^SF\d{12,}$/i.test(num)) return "SF Express";
  
  // UK carriers
  if (/^[A-Z]{2}\d{9}GB$/i.test(num)) return "Royal Mail";
  
  return "Unknown Carrier";
}

function getTrackingUrl(carrier: string | null, trackingNumber: string): string | null {
  if (!carrier) return `https://17track.net/en/track#nums=${trackingNumber}`;
  
  const urls: Record<string, string> = {
    "DTDC": `https://www.dtdc.in/tracking/shipment-tracking.asp?strCnno=${trackingNumber}`,
    "Delhivery": `https://www.delhivery.com/track/package/${trackingNumber}`,
    "Blue Dart": `https://www.bluedart.com/tracking?tracknumbers=${trackingNumber}`,
    "India Post": `https://www.indiapost.gov.in/_layouts/15/DOP.Portal.Tracking/TrackConsignment.aspx`,
    "Ekart": `https://ekartlogistics.com/track/${trackingNumber}`,
    "Xpressbees": `https://www.xpressbees.com/track?awb=${trackingNumber}`,
    "UPS": `https://www.ups.com/track?tracknum=${trackingNumber}`,
    "FedEx": `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
    "USPS": `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
    "Amazon": `https://track.amazon.com/tracking/${trackingNumber}`,
    "DHL": `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
    "Royal Mail": `https://www.royalmail.com/track-your-item#/tracking-results/${trackingNumber}`,
    "Cainiao": `https://global.cainiao.com/detail.htm?mailNoList=${trackingNumber}`,
    "Unknown Carrier": `https://17track.net/en/track#nums=${trackingNumber}`,
  };
  
  return urls[carrier] || `https://17track.net/en/track#nums=${trackingNumber}`;
}

function normalizeStatus(status: string | undefined): string {
  if (!status) return "pending";
  
  const lower = status.toLowerCase();
  
  if (lower === "not_found" || lower.includes("not found")) return "not_found";
  if (lower.includes("delivered")) return "delivered";
  if (lower.includes("out for delivery") || lower.includes("out_for_delivery")) return "out_for_delivery";
  if (lower.includes("transit") || lower.includes("shipped") || lower.includes("departed")) return "in_transit";
  if (lower.includes("exception") || lower.includes("delay") || lower.includes("failed")) return "exception";
  if (lower.includes("pending") || lower.includes("processing") || lower.includes("label")) return "pending";
  
  return "in_transit";
}
