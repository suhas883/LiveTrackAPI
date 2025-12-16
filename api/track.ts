import type { VercelRequest, VercelResponse } from '@vercel/node';

const TRACKINGMORE_API_URL = "https://api.trackingmore.com/v4";
const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

// Carrier code mapping
const CARRIER_CODE_MAP: Record<string, string> = {
  'dtdc': 'dtdc',
  'fedex': 'fedex',
  'ups': 'ups',
  'usps': 'usps',
  'dhl': 'dhl',
  'bluedart': 'bluedart',
  'delhivery': 'delhivery',
  'amazon': 'amazon-logistics-us',
  'india post': 'india-post',
};

function detectCarrier(trackingNumber: string): string {
  const num = trackingNumber.trim().toUpperCase();
  
  // DTDC - starts with B, C, D, E, N, P, X followed by 8-9 digits
  if (/^[BCDENPX]\d{8,9}$/i.test(num)) return "dtdc";
  
  // UPS
  if (/^1Z[A-Z0-9]{16}$/i.test(num)) return "ups";
  
  // FedEx
  if (/^\d{12}$/.test(num) || /^\d{15}$/.test(num) || /^\d{20}$/.test(num)) return "fedex";
  
  // USPS
  if (/^(94|93|92|91|90)\d{18,20}$/.test(num) || /^\d{20,22}$/.test(num)) return "usps";
  
  // DHL
  if (/^\d{10}$/.test(num)) return "dhl";
  
  // Delhivery
  if (/^\d{13,14}$/.test(num)) return "delhivery";
  
  // Blue Dart
  if (/^\d{9}$/.test(num) || /^\d{11}$/.test(num)) return "bluedart";
  
  // India Post
  if (/^E[A-Z]\d{9}IN$/i.test(num) || /^R[A-Z]\d{9}IN$/i.test(num)) return "india-post";
  
  return "auto";
}

function mapStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'Pending',
    'notfound': 'Not Found',
    'transit': 'In Transit',
    'pickup': 'Picked Up',
    'delivered': 'Delivered',
    'undelivered': 'Delivery Failed',
    'exception': 'Exception',
    'expired': 'Expired',
  };
  return statusMap[status] || status;
}

async function trackWithTrackingMore(trackingNumber: string, carrier: string) {
  const apiKey = process.env.TRACKINGMORE_API_KEY;
  
  if (!apiKey) {
    console.log('[TrackingMore] API key not configured');
    return null;
  }

  const courierCode = CARRIER_CODE_MAP[carrier.toLowerCase()] || carrier.toLowerCase();
  console.log(`[TrackingMore] Tracking ${trackingNumber} with carrier: ${courierCode}`);

  try {
    // Try to create tracking
    const createResponse = await fetch(`${TRACKINGMORE_API_URL}/trackings/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Tracking-Api-Key': apiKey
      },
      body: JSON.stringify({
        tracking_number: trackingNumber,
        courier_code: courierCode === 'auto' ? undefined : courierCode
      })
    });

    const createData = await createResponse.json();
    console.log(`[TrackingMore] Create response code: ${createData.meta.code}`);

    if (createData.meta.code === 200) {
      return formatTrackingResult(createData.data, trackingNumber);
    }
    
    if (createData.meta.code === 4016 || createData.meta.code === 4101) {
      // Tracking exists, fetch it
      const getResponse = await fetch(
        `${TRACKINGMORE_API_URL}/trackings/get?tracking_numbers=${trackingNumber}&courier_code=${courierCode}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Tracking-Api-Key': apiKey
          }
        }
      );

      const getData = await getResponse.json();
      if (getData.meta.code === 200 && Array.isArray(getData.data) && getData.data.length > 0) {
        return formatTrackingResult(getData.data[0], trackingNumber);
      }
    }

    return { notFound: true, error: createData.meta.message };

  } catch (error) {
    console.error('[TrackingMore] API error:', error);
    return null;
  }
}

function formatTrackingResult(data: any, trackingNumber: string) {
  const allEvents: any[] = [];
  
  // Parse origin_info.trackinfo
  if (data.origin_info?.trackinfo && Array.isArray(data.origin_info.trackinfo)) {
    data.origin_info.trackinfo.forEach((event: any) => {
      const dateTime = event.checkpoint_date || '';
      let dateStr = '';
      let timeStr = '';
      if (dateTime) {
        const dateObj = new Date(dateTime);
        dateStr = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      }
      allEvents.push({
        date: dateStr,
        time: timeStr,
        timestamp: dateTime,
        status: event.checkpoint_delivery_status || '',
        description: event.tracking_detail || '',
        location: event.location || ''
      });
    });
  }

  // Sort events by date (most recent first)
  allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Determine status
  let displayStatus = 'Unknown';
  if (data.delivery_status) {
    const statusMap: Record<string, string> = {
      'delivered': 'Delivered',
      'transit': 'In Transit',
      'pending': 'Pending',
      'pickup': 'Picked Up',
      'exception': 'Exception',
    };
    displayStatus = statusMap[data.delivery_status.toLowerCase()] || data.delivery_status;
  }

  const isDelivered = displayStatus === 'Delivered';
  const latestEvent = allEvents[0];
  const courierName = data.courier_name || (data.courier_code ? data.courier_code.toUpperCase() : 'Unknown');

  return {
    trackingNumber,
    carrier: courierName,
    status: displayStatus,
    notFound: false,
    estimatedDelivery: data.latest_estimated_delivery_date || (isDelivered ? latestEvent?.timestamp : null),
    lastUpdated: latestEvent?.timestamp || null,
    events: allEvents,
    aiPrediction: {
      prediction: isDelivered 
        ? 'Your package was delivered successfully.'
        : `Your package is ${displayStatus.toLowerCase()}.`,
      confidence: 95,
      reasoning: `Live tracking data showing ${allEvents.length} events.`
    },
    recommendations: isDelivered 
      ? ["Package delivered", "Confirm receipt"]
      : ["Track for updates", "Contact carrier if needed"]
  };
}

async function enhanceWithAI(trackingResult: any) {
  const perplexityKey = process.env.PERPLEXITY_API_KEY;
  
  if (!perplexityKey || !trackingResult || trackingResult.notFound || trackingResult.status === 'Delivered') {
    return trackingResult;
  }

  try {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'You are a logistics expert. Provide brief delivery predictions in JSON format.'
          },
          {
            role: 'user',
            content: `Analyze: Carrier ${trackingResult.carrier}, Status: ${trackingResult.status}, Last: ${trackingResult.events?.[0]?.location || 'Unknown'}. Return JSON: {"prediction": "brief prediction", "delayRisk": {"level": "low|medium|high"}, "recommendations": ["tip1", "tip2"]}`
          }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) return trackingResult;

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const aiInsights = JSON.parse(jsonMatch[0]);
        return {
          ...trackingResult,
          aiPrediction: { ...trackingResult.aiPrediction, prediction: aiInsights.prediction },
          delayRisk: aiInsights.delayRisk,
          recommendations: aiInsights.recommendations || trackingResult.recommendations
        };
      }
    } catch (e) {}
    
    return trackingResult;
  } catch (error) {
    return trackingResult;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { trackingNumber, carrier } = req.body;
    
    if (!trackingNumber) {
      return res.status(400).json({ error: 'Tracking number is required' });
    }

    const detectedCarrier = carrier || detectCarrier(trackingNumber);
    console.log(`[API] Tracking ${trackingNumber}, carrier: ${detectedCarrier}`);

    let result = await trackWithTrackingMore(trackingNumber, detectedCarrier);
    
    if (result && !result.notFound) {
      result = await enhanceWithAI(result);
      return res.status(200).json(result);
    }

    return res.status(200).json({
      trackingNumber,
      carrier: detectedCarrier.toUpperCase(),
      status: 'Not Found',
      notFound: true,
      events: [],
      aiPrediction: {
        prediction: 'Tracking number not found. Please verify and try again.',
        confidence: 90,
        reasoning: 'No tracking data available'
      },
      recommendations: ['Verify tracking number', 'Contact sender']
    });

  } catch (error) {
    console.error('[API] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
