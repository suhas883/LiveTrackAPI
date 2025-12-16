import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ChevronRight, Clock } from "lucide-react";
import { StatusBadge } from "./status-badge";
import type { TrackingHistory } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface RecentSearchesProps {
  searches: TrackingHistory[];
  onSelect: (trackingNumber: string) => void;
}

export function RecentSearches({ searches, onSelect }: RecentSearchesProps) {
  if (!searches || searches.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3" data-testid="recent-searches">
      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Recent Searches
      </h3>
      <div className="grid gap-2">
        {searches.slice(0, 5).map((search) => (
          <Card 
            key={search.id} 
            className="hover-elevate cursor-pointer transition-colors"
            onClick={() => onSelect(search.trackingNumber)}
            data-testid={`card-recent-search-${search.id}`}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-medium truncate" data-testid={`text-search-tracking-${search.id}`}>
                      {search.trackingNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {search.courier || "Unknown carrier"} • {formatDistanceToNow(new Date(search.searchedAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {search.lastStatus && (
                    <StatusBadge status={search.lastStatus} size="sm" />
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
