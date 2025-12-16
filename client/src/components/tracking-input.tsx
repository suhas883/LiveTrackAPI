import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TrackingInputProps {
  onTrack: (trackingNumber: string) => void;
  isLoading?: boolean;
  size?: "default" | "large";
}

export function TrackingInput({ onTrack, isLoading = false, size = "default" }: TrackingInputProps) {
  const [trackingNumber, setTrackingNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = trackingNumber.trim();
    if (trimmed) {
      onTrack(trimmed);
    }
  };

  const isLarge = size === "large";

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className={`flex gap-2 ${isLarge ? "flex-col sm:flex-row" : ""}`}>
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground ${isLarge ? "h-5 w-5" : "h-4 w-4"}`} />
          <Input
            type="text"
            placeholder="Enter tracking number (e.g., 1Z999AA10123456784)"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className={`pl-10 ${isLarge ? "h-14 text-lg" : ""}`}
            disabled={isLoading}
            data-testid="input-tracking-number"
          />
        </div>
        <Button 
          type="submit" 
          disabled={!trackingNumber.trim() || isLoading}
          className={isLarge ? "h-14 px-8 text-lg" : ""}
          data-testid="button-track"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Tracking...
            </>
          ) : (
            "Track Package"
          )}
        </Button>
      </div>
    </form>
  );
}
