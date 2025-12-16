import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import { TrackingTimeline } from "./tracking-timeline";
import { Package, Truck, MapPin, Calendar, Clock, Copy, Check, ExternalLink, Brain, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import type { TrackingRecord, TrackingEvent } from "@shared/schema";

interface TrackingResultProps {
  tracking: TrackingRecord & { 
    trackingUrl?: string | null;
    aiPrediction?: string | null;
    confidence?: number;
  };
}

export function TrackingResult({ tracking }: TrackingResultProps) {
  const [copied, setCopied] = useState(false);

  const copyTrackingNumber = async () => {
    await navigator.clipboard.writeText(tracking.trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const events = (tracking.events || []) as TrackingEvent[];

  return (
    <div className="space-y-6" data-testid="tracking-result">
      {/* Main Status Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-mono" data-testid="text-tracking-number">
                  {tracking.trackingNumber}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={copyTrackingNumber}
                  data-testid="button-copy-tracking"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {tracking.courier && (
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm text-muted-foreground" data-testid="text-courier">
                    Carrier: {tracking.courier}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Powered
                  </Badge>
                </div>
              )}
            </div>
            <StatusBadge status={tracking.status} />
          </div>
        </CardHeader>
        <CardContent>
          {tracking.statusDescription && (
            <p className="text-muted-foreground mb-4" data-testid="text-status-description">
              {tracking.statusDescription}
            </p>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tracking.origin && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Origin</p>
                  <p className="text-sm font-medium" data-testid="text-origin">{tracking.origin}</p>
                </div>
              </div>
            )}
            {tracking.destination && (
              <div className="flex items-start gap-2">
                <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Destination</p>
                  <p className="text-sm font-medium" data-testid="text-destination">{tracking.destination}</p>
                </div>
              </div>
            )}
            {tracking.estimatedDelivery && (
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Est. Delivery</p>
                  <p className="text-sm font-medium" data-testid="text-est-delivery">{tracking.estimatedDelivery}</p>
                </div>
              </div>
            )}
            {tracking.lastUpdate && (
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Last Update</p>
                  <p className="text-sm font-medium" data-testid="text-last-update">{tracking.lastUpdate}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Prediction Card */}
      {tracking.aiPrediction && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between gap-2 text-lg">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <span>AI Prediction</span>
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              {tracking.confidence !== undefined && (
                <Badge variant="outline" className="text-xs">
                  {Math.round(tracking.confidence * 100)}% confidence
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed" data-testid="text-ai-prediction">
              {tracking.aiPrediction}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Timeline Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Truck className="h-5 w-5" />
            Tracking History
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <TrackingTimeline events={events} />
        </CardContent>
      </Card>
    </div>
  );
}
