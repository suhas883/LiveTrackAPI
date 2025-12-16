import { CheckCircle2, Circle, MapPin } from "lucide-react";
import type { TrackingEvent } from "@shared/schema";

interface TrackingTimelineProps {
  events: TrackingEvent[];
}

export function TrackingTimeline({ events }: TrackingTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground" data-testid="text-no-events">
        No tracking events available yet.
      </div>
    );
  }

  return (
    <div className="relative" data-testid="tracking-timeline">
      {events.map((event, index) => {
        const isFirst = index === 0;
        const isLast = index === events.length - 1;

        return (
          <div key={index} className="relative pl-8 pb-8 last:pb-0" data-testid={`timeline-event-${index}`}>
            {/* Vertical line */}
            {!isLast && (
              <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-border" />
            )}

            {/* Icon */}
            <div className="absolute left-0 top-1">
              {isFirst ? (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-muted bg-background">
                  <Circle className="h-2 w-2 fill-muted-foreground text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`font-medium ${isFirst ? "text-foreground" : "text-muted-foreground"}`}>
                  {event.status}
                </span>
                <span className="text-sm text-muted-foreground">
                  {event.date}
                  {event.time && ` at ${event.time}`}
                </span>
              </div>
              {event.description && (
                <p className="text-sm text-muted-foreground mb-1">
                  {event.description}
                </p>
              )}
              {event.location && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
