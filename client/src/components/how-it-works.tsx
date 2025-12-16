import { Search, Cpu, Truck } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "1",
    title: "Enter Tracking Number",
    description: "Paste any tracking number from UPS, FedEx, DHL, USPS, and 500+ more carriers.",
  },
  {
    icon: Cpu,
    step: "2", 
    title: "AI Detects Courier",
    description: "Our AI instantly identifies the carrier and retrieves the latest tracking data.",
  },
  {
    icon: Truck,
    step: "3",
    title: "Get Real-time Updates",
    description: "View complete tracking history with estimated delivery and status updates.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-12 px-4 bg-muted/30" data-testid="how-it-works-section">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-2xl font-semibold text-center mb-8">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center" data-testid={`step-${index}`}>
              <div className="relative inline-flex mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <step.icon className="h-7 w-7" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-background border-2 border-primary text-xs font-bold text-primary">
                  {step.step}
                </span>
              </div>
              <h3 className="font-medium mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
