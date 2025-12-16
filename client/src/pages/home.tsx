import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Package, Globe } from "lucide-react";
import { TrackingInput } from "@/components/tracking-input";
import { TrackingResult } from "@/components/tracking-result";
import { RecentSearches } from "@/components/recent-searches";
import { FeaturesSection } from "@/components/features-section";
import { HowItWorks } from "@/components/how-it-works";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { TrackingRecord, TrackingHistory } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentTracking, setCurrentTracking] = useState<TrackingRecord | null>(null);

  // Fetch recent searches
  const { data: recentSearches = [], isLoading: loadingHistory } = useQuery<TrackingHistory[]>({
    queryKey: ["/api/history"],
  });

  // Track mutation
  const trackMutation = useMutation({
    mutationFn: async (trackingNumber: string) => {
      const response = await apiRequest("POST", "/api/track", { trackingNumber });
      return response.json();
    },
    onSuccess: (data: TrackingRecord) => {
      setCurrentTracking(data);
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Tracking Failed",
        description: error.message || "Unable to track this package. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleTrack = (trackingNumber: string) => {
    setCurrentTracking(null);
    trackMutation.mutate(trackingNumber);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4 bg-gradient-to-b from-primary/5 to-background" data-testid="hero-section">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
              <Package className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-hero-title">
            Track Any Package, Anywhere
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto" data-testid="text-hero-subtitle">
            AI-powered package tracking for 500+ carriers worldwide. Just enter your tracking number.
          </p>
          
          {/* Tracking Input */}
          <div className="max-w-2xl mx-auto mb-6">
            <TrackingInput 
              onTrack={handleTrack} 
              isLoading={trackMutation.isPending}
              size="large"
            />
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" />
            <span>Supporting UPS, FedEx, DHL, USPS, and 500+ more carriers</span>
          </div>
        </div>
      </section>

      {/* Results Section */}
      {(trackMutation.isPending || currentTracking) && (
        <section className="py-8 px-4" data-testid="results-section">
          <div className="container mx-auto max-w-3xl">
            {trackMutation.isPending ? (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                </CardContent>
              </Card>
            ) : currentTracking ? (
              <TrackingResult tracking={currentTracking} />
            ) : null}
          </div>
        </section>
      )}

      {/* Recent Searches */}
      {!currentTracking && !trackMutation.isPending && (
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-3xl">
            {loadingHistory ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-32" />
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <RecentSearches searches={recentSearches} onSelect={handleTrack} />
            )}
          </div>
        </section>
      )}

      {/* Features Section */}
      {!currentTracking && !trackMutation.isPending && <FeaturesSection />}

      {/* How It Works */}
      {!currentTracking && !trackMutation.isPending && <HowItWorks />}
    </div>
  );
}
