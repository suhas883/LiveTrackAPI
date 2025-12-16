import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { trackPackageWithPerplexity } from "./perplexity";
import { trackWithTrackingMore, enhanceWithAI } from "./trackingmore";
import { trackRequestSchema } from "@shared/schema";
import { z } from "zod";

// Detect carrier from tracking number pattern
function detectCarrierFromNumber(trackingNumber: string): string {
  const num = trackingNumber.trim().toUpperCase();
  
  // Indian carriers - DTDC can start with B, C, D, E, N, P, X followed by 8-9 digits
  if (/^[BCDENPX]\d{8,9}$/i.test(num)) return "DTDC";
  if (/^\d{13,14}$/.test(num) && num.length >= 13) return "Delhivery";
  if (/^\d{9}$/.test(num) || /^\d{11}$/.test(num)) return "Blue Dart";
  if (/^E[A-Z]\d{9}IN$/i.test(num) || /^R[A-Z]\d{9}IN$/i.test(num)) return "India Post";
  if (/^FMPP\d+$/i.test(num) || /^OD\d+$/i.test(num)) return "Ekart";
  if (/^XB\d+$/i.test(num)) return "Xpressbees";
  
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

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Track a package
  app.post("/api/track", async (req, res) => {
    try {
      // Validate request body
      const validationResult = trackRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid request", 
          details: validationResult.error.errors 
        });
      }

      const { trackingNumber, carrier } = validationResult.data;

      // Basic validation - tracking number must be alphanumeric and reasonable length
      const cleanNumber = trackingNumber.trim().replace(/\s+/g, '');
      if (cleanNumber.length < 8 || cleanNumber.length > 40) {
        return res.status(400).json({
          error: "Invalid tracking number",
          message: "Please enter a valid tracking number (8-40 characters)"
        });
      }

      if (!/^[A-Za-z0-9]+$/.test(cleanNumber)) {
        return res.status(400).json({
          error: "Invalid tracking number format",
          message: "Tracking number should only contain letters and numbers"
        });
      }

      // Detect carrier from tracking number pattern FIRST
      const detectedCarrier = (carrier && carrier !== 'auto') 
        ? carrier.toUpperCase() 
        : detectCarrierFromNumber(cleanNumber);
      
      console.log(`[Track API] Tracking: ${cleanNumber}, Detected Carrier: ${detectedCarrier}`);

      // Try TrackingMore API first (if API key is configured)
      let trackingInfo = null;
      
      if (process.env.TRACKINGMORE_API_KEY) {
        console.log(`[Track API] Using TrackingMore API...`);
        trackingInfo = await trackWithTrackingMore(cleanNumber, detectedCarrier);
        
        if (trackingInfo && !trackingInfo.notFound) {
          console.log(`[Track API] TrackingMore returned ${trackingInfo.events?.length || 0} events`);
          
          // Enhance with Perplexity AI insights for in-transit packages
          if (trackingInfo.status !== 'Delivered' && process.env.PERPLEXITY_API_KEY) {
            console.log(`[Track API] Enhancing with Perplexity AI insights...`);
            trackingInfo = await enhanceWithAI(trackingInfo);
          }
        } else {
          console.log(`[Track API] TrackingMore had no data, falling back to Perplexity`);
          trackingInfo = null;
        }
      }
      
      // Fall back to Perplexity if TrackingMore didn't work
      if (!trackingInfo) {
        console.log(`[Track API] Using Perplexity Sonar Pro...`);
        trackingInfo = await trackPackageWithPerplexity(cleanNumber, detectedCarrier);
      }

      // If carrier is truly unknown and no events found, but still show results for recognized carriers
      // Only return 404 for completely unrecognized formats with no data
      const isUnknownCarrier = trackingInfo.courier === "Unknown" || trackingInfo.courier === "Unknown Carrier";
      const hasNoEvents = !trackingInfo.events || trackingInfo.events.length === 0;
      const hasNoPrediction = !trackingInfo.aiPrediction || trackingInfo.confidence < 50;
      
      if (isUnknownCarrier && hasNoEvents && hasNoPrediction) {
        return res.status(404).json({
          error: "Tracking number not found",
          message: "Unable to find tracking information. Please verify your tracking number and try again."
        });
      }

      // Save to database
      const record = await storage.createTrackingRecord({
        trackingNumber,
        courier: trackingInfo.courier,
        courierCode: trackingInfo.courierCode,
        status: trackingInfo.status,
        statusDescription: trackingInfo.statusDescription,
        origin: trackingInfo.origin,
        destination: trackingInfo.destination,
        estimatedDelivery: trackingInfo.estimatedDelivery,
        lastUpdate: trackingInfo.lastUpdate,
        events: trackingInfo.events,
        rawResponse: trackingInfo.rawResponse,
      });

      // Add to history
      await storage.createTrackingHistory({
        trackingNumber,
        courier: trackingInfo.courier,
        lastStatus: trackingInfo.status,
      });

      // Return response in format expected by frontend
      const hasRealEvents = (record.events || []).length > 0;
      const isNotFound = trackingInfo.notFound === true || trackingInfo.status === "not_found";
      
      // Format status for display (normalize to lowercase for comparison)
      const getDisplayStatus = () => {
        if (isNotFound) return "Not Found";
        const normalizedStatus = (trackingInfo.status || "").toLowerCase();
        if (normalizedStatus === "delivered") return "Delivered";
        if (normalizedStatus === "out_for_delivery" || normalizedStatus === "out for delivery") return "Out for Delivery";
        if (normalizedStatus === "in_transit" || normalizedStatus === "in transit" || normalizedStatus === "transit") return "In Transit";
        if (normalizedStatus === "exception") return "Exception";
        if (normalizedStatus === "pending" || normalizedStatus === "info received") return "Pending";
        if (normalizedStatus === "picked up" || normalizedStatus === "pickup") return "Picked Up";
        // If already capitalized properly, return as-is
        if (trackingInfo.status && trackingInfo.status !== "unknown") return trackingInfo.status;
        return "Processing";
      };
      
      // Always use the detected carrier, not the one from API
      const finalCarrier = detectedCarrier || trackingInfo.courier || "Unknown";
      
      return res.json({
        trackingNumber: record.trackingNumber,
        carrier: finalCarrier,
        status: getDisplayStatus(),
        notFound: isNotFound,
        estimatedDelivery: record.estimatedDelivery || trackingInfo.estimatedDelivery || null,
        lastUpdated: record.lastUpdate || trackingInfo.lastUpdate || null,
        events: (record.events || []).map((e: any) => ({
          status: e.status || "Update",
          location: e.location || "",
          city: e.city || "",
          state: e.state || "",
          country: e.country || "",
          date: e.date || "",
          time: e.time || "",
          timestamp: e.timestamp || e.date || "",
          description: e.description || e.status || ""
        })),
        origin: trackingInfo.origin,
        destination: trackingInfo.destination,
        trackingUrl: trackingInfo.trackingUrl,
        aiPrediction: trackingInfo.aiPrediction || {
          prediction: isNotFound 
            ? `Tracking number ${trackingNumber} was not found. Please verify the number is correct.`
            : hasRealEvents 
              ? "Package is being tracked" 
              : "Awaiting tracking data from carrier.",
          confidence: isNotFound ? 90 : (hasRealEvents ? 80 : 50),
          reasoning: isNotFound
            ? "No shipment record exists for this tracking number in the carrier system"
            : hasRealEvents 
              ? "Based on carrier tracking data" 
              : "No tracking events found in carrier systems yet"
        },
        weatherImpact: null,
        delayRisk: hasRealEvents ? trackingInfo.delayRisk : null,
        recommendations: trackingInfo.recommendations || (isNotFound
          ? [
              "Double-check the tracking number for typos",
              "Contact the sender to verify the tracking number",
              "Make sure the package has actually been shipped"
            ]
          : [
              "Check back in 24-48 hours for updates",
              "Contact the sender if no updates appear"
            ])
      });
    } catch (error) {
      console.error("Error tracking package:", error);
      return res.status(500).json({ 
        error: "Failed to track package",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get a specific tracking record by ID
  app.get("/api/track/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ error: "Tracking ID is required" });
      }

      const record = await storage.getTrackingRecord(id);
      
      if (!record) {
        return res.status(404).json({ error: "Tracking record not found" });
      }

      return res.json(record);
    } catch (error) {
      console.error("Error fetching tracking record:", error);
      return res.status(500).json({ error: "Failed to fetch tracking record" });
    }
  });

  // Get tracking history
  app.get("/api/history", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const history = await storage.getTrackingHistory(limit);
      return res.json(history);
    } catch (error) {
      console.error("Error fetching history:", error);
      return res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  // Delete a history item
  app.delete("/api/history/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ error: "History ID is required" });
      }

      const deleted = await storage.deleteTrackingHistory(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "History item not found" });
      }

      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting history:", error);
      return res.status(500).json({ error: "Failed to delete history item" });
    }
  });

  // AI Chat endpoint using Perplexity
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required" });
      }

      const apiKey = process.env.PERPLEXITY_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "AI service not configured" });
      }

      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "sonar",
          messages: [
            {
              role: "system",
              content: "You are a helpful package tracking assistant for LiveTrackings.com. Help users with tracking questions, explain shipping delays, provide delivery estimates, and answer questions about carriers like UPS, FedEx, USPS, DHL, DTDC, Delhivery, and 800+ other global couriers. Be friendly and concise."
            },
            ...messages.slice(-10) // Keep last 10 messages for context
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = data.choices?.[0]?.message?.content || "I'm here to help with your tracking questions!";

      return res.json({ message: assistantMessage });
    } catch (error) {
      console.error("Chat error:", error);
      return res.json({ 
        message: "I can help you with tracking questions! Try asking about tracking numbers, delivery times, or carrier information."
      });
    }
  });

  return httpServer;
}
