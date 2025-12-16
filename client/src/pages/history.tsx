import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { History as HistoryIcon, Package, Trash2, RefreshCw, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import type { TrackingHistory } from "@shared/schema";

export default function History() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: history = [], isLoading, refetch, isRefetching } = useQuery<TrackingHistory[]>({
    queryKey: ["/api/history"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/history/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
      toast({
        title: "Deleted",
        description: "Tracking record removed from history.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete tracking record.",
        variant: "destructive",
      });
    },
  });

  const handleTrack = (trackingNumber: string) => {
    setLocation(`/?track=${encodeURIComponent(trackingNumber)}`);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HistoryIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold" data-testid="text-history-title">Tracking History</h1>
              <p className="text-sm text-muted-foreground">Your recent package tracking searches</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            data-testid="button-refresh-history"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* History List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-md" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : history.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium mb-2">No tracking history yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start tracking packages and they'll appear here.
              </p>
              <Button onClick={() => setLocation("/")} data-testid="button-start-tracking">
                Track a Package
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3" data-testid="history-list">
            {history.map((item) => (
              <Card 
                key={item.id} 
                className="hover-elevate cursor-pointer transition-colors group"
                data-testid={`card-history-${item.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div 
                      className="flex items-center gap-3 flex-1 min-w-0"
                      onClick={() => handleTrack(item.trackingNumber)}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted shrink-0">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono text-sm font-medium truncate" data-testid={`text-history-tracking-${item.id}`}>
                          {item.trackingNumber}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{item.courier || "Unknown carrier"}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(item.searchedAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.lastStatus && (
                        <StatusBadge status={item.lastStatus} size="sm" />
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate(item.id);
                        }}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-${item.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
