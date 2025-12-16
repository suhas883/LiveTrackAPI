// TrackingMore API Integration
// Documentation: https://www.trackingmore.com/v3/api-index.html
// 
// HYBRID ARCHITECTURE:
// - TrackingMore: Raw tracking data (events, status, locations)
// - Perplexity RAG: AI intelligence layer (predictions, weather, recommendations)

const TRACKINGMORE_API_URL = "https://api.trackingmore.com/v4";
const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

export interface TrackingMoreEvent {
  Date: string;
  StatusDescription: string;
  Details: string;
  checkpoint_status: string;
}

export interface TrackingMoreResult {
  id: string;
  tracking_number: string;
  courier_code: string;
  courier_name?: string;
  status?: number | string; // Can be number (1,2,4,11) or string
  delivery_status?: string; // "delivered", "transit", "pending", etc.
  substatus?: string;
  status_info?: string;
  package_status?: string;
  lastEvent?: string;
  lastUpdateTime?: string;
  latest_event?: string;
  latest_checkpoint_time?: string;
  origin_country?: string;
  destination_country?: string;
  itemTimeLength?: number;
  stayTimeLength?: number;
  original_estimated_delivery_date?: string;
  latest_estimated_delivery_date?: string;
  signed_by?: string;
  scheduled_delivery_date?: string;
  scheduled_address?: string;
  latest_checkpoint_time_zone?: string;
  lastest_checkpoint_time?: string;
  tracking_detail?: {
    tag?: string;
    items?: Array<{
      checkpoint_date: string;
      tracking_detail: string;
      location?: string;
      checkpoint_delivery_status?: string;
      checkpoint_delivery_substatus?: string;
    }>;
  };
  origin_info?: {
    ItemReceived?: string;
    ItemDispatched?: string;
    DepartedAirport?: {
      Date?: string;
      Details?: string;
    };
    courier_code?: string;
    trackinfo?: TrackingMoreEvent[];
  };
  destination_info?: {
    ArrivedDestination?: string;
    DestinationDelivered?: string;
    courier_code?: string;
    trackinfo?: TrackingMoreEvent[];
  };
  transit_time?: number;
  stay_time?: number;
}

export interface TrackingMoreResponse {
  meta: {
    code: number;
    type?: string;
    message?: string;
  };
  data: TrackingMoreResult | TrackingMoreResult[];
}

// Carrier code mapping for TrackingMore API
const CARRIER_CODE_MAP: Record<string, string> = {
  'dtdc': 'dtdc',
  'fedex': 'fedex',
  'ups': 'ups',
  'usps': 'usps',
  'dhl': 'dhl',
  'dhl express': 'dhl',
  'blue dart': 'bluedart',
  'bluedart': 'bluedart',
  'india post': 'india-post',
  'delhivery': 'delhivery',
  'amazon': 'amazon-logistics-us',
  'amazon logistics': 'amazon-logistics-us',
  'ecom express': 'ecom-express',
  'xpressbees': 'xpressbees',
  'shadowfax': 'shadowfax',
  'ekart': 'ekart',
  'gati': 'gati',
  'professional couriers': 'professional-couriers',
  'first flight': 'first-flight-couriers',
  'trackon': 'trackon-couriers',
  'safexpress': 'safexpress'
};

function getCarrierCode(carrier: string): string {
  const lowerCarrier = carrier.toLowerCase().trim();
  return CARRIER_CODE_MAP[lowerCarrier] || lowerCarrier;
}

// Map TrackingMore status to our status format
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
    'InfoReceived': 'Info Received'
  };
  return statusMap[status] || status;
}

export async function trackWithTrackingMore(
  trackingNumber: string, 
  carrier: string
): Promise<any> {
  const apiKey = process.env.TRACKINGMORE_API_KEY;
  
  if (!apiKey) {
    console.log('[TrackingMore] API key not configured');
    return null;
  }

  const courierCode = getCarrierCode(carrier);
  console.log(`[TrackingMore] Tracking ${trackingNumber} with carrier: ${courierCode}`);

  try {
    // First, try to create and get tracking in one call (realtime endpoint)
    const createResponse = await fetch(`${TRACKINGMORE_API_URL}/trackings/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Tracking-Api-Key': apiKey
      },
      body: JSON.stringify({
        tracking_number: trackingNumber,
        courier_code: courierCode
      })
    });

    const createData: TrackingMoreResponse = await createResponse.json();
    console.log(`[TrackingMore] Create response code: ${createData.meta.code}`);

    // Log full response for debugging
    console.log(`[TrackingMore] Full response:`, JSON.stringify(createData.data, null, 2).substring(0, 500));

    // Handle different response codes
    if (createData.meta.code === 200) {
      // Success - tracking created and data returned
      const result = createData.data as TrackingMoreResult;
      if (result) {
        return formatTrackingResult(result, trackingNumber);
      }
    } 
    
    if (createData.meta.code === 4016 || createData.meta.code === 4101) {
      // Tracking already exists (4016 or 4101), fetch it
      console.log('[TrackingMore] Tracking exists, fetching with GET...');
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

      const getData: TrackingMoreResponse = await getResponse.json();
      console.log(`[TrackingMore] Get response code: ${getData.meta.code}`);
      console.log(`[TrackingMore] Get full response:`, JSON.stringify(getData.data, null, 2).substring(0, 2500));

      if (getData.meta.code === 200 && Array.isArray(getData.data) && getData.data.length > 0) {
        return formatTrackingResult(getData.data[0], trackingNumber);
      }
    }

    if (createData.meta.code === 4031) {
      // Invalid courier code - try auto-detect
      console.log('[TrackingMore] Invalid carrier, trying auto-detect...');
      const detectResponse = await fetch(`${TRACKINGMORE_API_URL}/trackings/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Tracking-Api-Key': apiKey
        },
        body: JSON.stringify({
          tracking_number: trackingNumber
          // No courier_code - let TrackingMore auto-detect
        })
      });

      const detectData: TrackingMoreResponse = await detectResponse.json();
      console.log(`[TrackingMore] Auto-detect response: ${detectData.meta.code}`);

      if (detectData.meta.code === 200) {
        return formatTrackingResult(detectData.data as TrackingMoreResult, trackingNumber);
      }
    }

    // Handle errors
    console.log(`[TrackingMore] Error: ${createData.meta.message || 'Unknown error'}`);
    return {
      notFound: true,
      error: createData.meta.message || 'Tracking not found',
      code: createData.meta.code
    };

  } catch (error) {
    console.error('[TrackingMore] API error:', error);
    return null;
  }
}

function formatTrackingResult(data: TrackingMoreResult, trackingNumber: string): any {
  console.log(`[TrackingMore] Formatting result for ${trackingNumber}`);
  console.log(`[TrackingMore] Raw status: ${data.status}, package_status: ${data.package_status}, Courier: ${data.courier_code}`);

  // Combine all tracking events
  const allEvents: any[] = [];
  
  // Get events from tracking_detail (v4 API format)
  if (data.tracking_detail?.items && Array.isArray(data.tracking_detail.items)) {
    data.tracking_detail.items.forEach((item) => {
      const dateTime = item.checkpoint_date || '';
      const dateParts = dateTime.split(' ');
      allEvents.push({
        date: dateParts[0] || '',
        time: dateParts[1] || '',
        timestamp: dateTime,
        status: item.checkpoint_delivery_status || item.checkpoint_delivery_substatus || '',
        description: item.tracking_detail || '',
        location: item.location || ''
      });
    });
  }
  
  // Parse origin_info.trackinfo (V4 API format)
  if (data.origin_info?.trackinfo && Array.isArray(data.origin_info.trackinfo)) {
    console.log(`[TrackingMore] Found ${data.origin_info.trackinfo.length} events in origin_info`);
    data.origin_info.trackinfo.forEach((event: any) => {
      const dateTime = event.checkpoint_date || '';
      // Parse ISO date format: "2025-12-03T11:47:00+00:00"
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
        status: event.checkpoint_delivery_status || event.tracking_detail || '',
        description: event.tracking_detail || event.checkpoint_delivery_substatus || '',
        location: event.location || ''
      });
    });
  }

  // Parse destination_info.trackinfo
  if (data.destination_info?.trackinfo && Array.isArray(data.destination_info.trackinfo)) {
    console.log(`[TrackingMore] Found ${data.destination_info.trackinfo.length} events in destination_info`);
    data.destination_info.trackinfo.forEach((event: any) => {
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
        status: event.checkpoint_delivery_status || event.tracking_detail || '',
        description: event.tracking_detail || event.checkpoint_delivery_substatus || '',
        location: event.location || ''
      });
    });
  }

  // Sort events by date (most recent first)
  allEvents.sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();
    return dateB - dateA;
  });

  // Determine status - prioritize delivery_status field
  let displayStatus = 'Unknown';
  
  // Check delivery_status first (most reliable for V4 API)
  if (data.delivery_status) {
    const deliveryStatusMap: Record<string, string> = {
      'delivered': 'Delivered',
      'transit': 'In Transit',
      'pending': 'Pending',
      'pickup': 'Picked Up',
      'exception': 'Exception',
      'expired': 'Expired',
      'notfound': 'Not Found',
      'undelivered': 'Undelivered',
      'InfoReceived': 'Info Received'
    };
    displayStatus = deliveryStatusMap[data.delivery_status.toLowerCase()] || data.delivery_status;
  } else if (typeof data.status === 'number') {
    // TrackingMore numeric status codes (fallback)
    const numericStatusMap: Record<number, string> = {
      1: 'Exception',
      2: 'In Transit',
      3: 'Picked Up',
      4: 'Delivered',
      5: 'Out for Delivery',
      6: 'Info Received',
      7: 'Pending',
      8: 'Expired',
      11: 'Not Found'
    };
    displayStatus = numericStatusMap[data.status] || 'In Transit';
  } else if (typeof data.status === 'string') {
    displayStatus = mapStatus(data.status);
  } else if (data.package_status) {
    displayStatus = data.package_status;
  }

  const isDelivered = displayStatus === 'Delivered' || data.delivery_status === 'delivered' || data.status === 4;
  const latestEvent = allEvents[0];

  // Get courier name  
  const courierName = data.courier_name || (data.courier_code ? data.courier_code.toUpperCase() : 'Unknown');

  return {
    courier: courierName,
    courierCode: data.courier_code || '',
    status: displayStatus,
    statusDescription: data.status_info || data.lastEvent || data.latest_event || null,
    origin: data.origin_country ? { city: '', state: '', country: data.origin_country } : null,
    destination: data.destination_country ? { city: '', state: '', country: data.destination_country } : null,
    estimatedDelivery: data.latest_estimated_delivery_date || data.original_estimated_delivery_date || (isDelivered ? latestEvent?.timestamp : null),
    lastUpdate: data.lastUpdateTime || data.latest_checkpoint_time || latestEvent?.timestamp || null,
    events: allEvents,
    trackingUrl: `https://www.trackingmore.com/track/${data.courier_code}/${trackingNumber}`,
    aiPrediction: {
      prediction: isDelivered 
        ? `Your package was delivered successfully.`
        : `Your package is ${displayStatus.toLowerCase()}. ${data.lastEvent || data.latest_event || ''}`,
      confidence: 95,
      reasoning: `Live tracking data from TrackingMore API showing ${allEvents.length} tracking events.`
    },
    weatherImpact: null,
    delayRisk: null,
    recommendations: isDelivered 
      ? ["Package has been delivered", "Contact recipient to confirm receipt"]
      : ["Track your package for updates", "Contact carrier for more information"],
    confidence: 95,
    notFound: allEvents.length === 0 && !isDelivered,
    transitTime: data.itemTimeLength || data.transit_time || null,
    stayTime: data.stayTimeLength || data.stay_time || null
  };
}

// Detect carrier using TrackingMore API
export async function detectCarrierWithTrackingMore(trackingNumber: string): Promise<string[]> {
  const apiKey = process.env.TRACKINGMORE_API_KEY;
  
  if (!apiKey) {
    return [];
  }

  try {
    const response = await fetch(`${TRACKINGMORE_API_URL}/couriers/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Tracking-Api-Key': apiKey
      },
      body: JSON.stringify({
        tracking_number: trackingNumber
      })
    });

    const data = await response.json();
    
    if (data.meta.code === 200 && Array.isArray(data.data)) {
      return data.data.map((c: any) => c.courier_code);
    }
  } catch (error) {
    console.error('[TrackingMore] Carrier detection error:', error);
  }

  return [];
}

// PERPLEXITY RAG: AI Enhancement Layer
// Analyzes tracking data to provide intelligent insights
export async function enhanceWithAI(trackingResult: any): Promise<any> {
  const perplexityKey = process.env.PERPLEXITY_API_KEY;
  
  if (!perplexityKey || !trackingResult || trackingResult.notFound) {
    return trackingResult; // Return as-is if no API key or no data
  }

  // Skip AI enhancement for delivered packages (not much to predict)
  if (trackingResult.status === 'Delivered') {
    return trackingResult;
  }

  try {
    console.log('[Perplexity AI] Enhancing tracking data with AI insights...');
    
    const today = new Date().toISOString().split('T')[0];
    const latestEvent = trackingResult.events?.[0];
    const destination = trackingResult.destination?.country || 'Unknown';
    
    const prompt = `Analyze this package tracking data and provide insights:

Carrier: ${trackingResult.courier}
Status: ${trackingResult.status}
Last Location: ${latestEvent?.location || 'Unknown'}
Last Update: ${latestEvent?.date || 'Unknown'} ${latestEvent?.time || ''}
Origin: ${trackingResult.origin?.country || 'Unknown'}
Destination: ${destination}
Transit Time So Far: ${trackingResult.transitTime || 'Unknown'} days

Today is ${today}. Based on the carrier's typical performance and current status:

1. What is the realistic delivery prediction?
2. What is the delay risk level (low/medium/high)?
3. Are there any weather or logistics concerns for the destination?
4. What should the customer do next?

Respond in JSON format:
{
  "prediction": "Expected delivery prediction",
  "confidence": 70-95,
  "reasoning": "Brief explanation",
  "delayRisk": {
    "level": "low|medium|high",
    "score": 1-100,
    "explanation": "Why this risk level"
  },
  "weatherImpact": {
    "condition": "Current weather concern or 'None'",
    "impact": "How it affects delivery"
  },
  "recommendations": ["Action 1", "Action 2", "Action 3"]
}`;

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
            content: 'You are a logistics expert analyzing package tracking data. Provide practical, actionable insights. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      console.log('[Perplexity AI] API error, returning original data');
      return trackingResult;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response
    let jsonMatch = content.match(/```json\s*([\s\S]*?)```/);
    let jsonStr = jsonMatch ? jsonMatch[1] : content;
    
    // Clean up the JSON string
    jsonStr = jsonStr.replace(/```/g, '').trim();
    
    try {
      const aiInsights = JSON.parse(jsonStr);
      console.log('[Perplexity AI] Successfully enhanced with AI insights');
      
      // Merge AI insights with tracking result
      return {
        ...trackingResult,
        aiPrediction: {
          prediction: aiInsights.prediction || trackingResult.aiPrediction?.prediction,
          confidence: aiInsights.confidence || trackingResult.aiPrediction?.confidence,
          reasoning: aiInsights.reasoning || trackingResult.aiPrediction?.reasoning
        },
        delayRisk: aiInsights.delayRisk || null,
        weatherImpact: aiInsights.weatherImpact?.condition !== 'None' ? aiInsights.weatherImpact : null,
        recommendations: aiInsights.recommendations || trackingResult.recommendations
      };
    } catch (parseError) {
      console.log('[Perplexity AI] Failed to parse AI response, using original data');
      return trackingResult;
    }
  } catch (error) {
    console.error('[Perplexity AI] Enhancement error:', error);
    return trackingResult;
  }
}
