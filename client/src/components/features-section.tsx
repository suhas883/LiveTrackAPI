import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Package, Bell, Clock } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI Courier Detection",
    description: "Automatically identifies the carrier from your tracking number using advanced AI.",
  },
  {
    icon: Package,
    title: "Multi-Package Tracking",
    description: "Track packages from any major courier worldwide in one place.",
  },
  {
    icon: Bell,
    title: "Real-time Updates",
    description: "Get instant status updates powered by Perplexity's Sonar Pro AI.",
  },
  {
    icon: Clock,
    title: "Tracking History",
    description: "Access your past tracking searches anytime with full timeline details.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-12 px-4" data-testid="features-section">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-2xl font-semibold text-center mb-8">
          Why LiveTrackings?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <Card key={index} className="border-card-border" data-testid={`card-feature-${index}`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
