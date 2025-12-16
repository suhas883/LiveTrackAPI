import { Badge } from "@/components/ui/badge";
import { Package, Truck, CheckCircle2, AlertTriangle, Clock, HelpCircle } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "default";
}

const statusConfig: Record<string, { 
  label: string; 
  variant: "default" | "secondary" | "destructive" | "outline";
  icon: typeof Package;
  className: string;
}> = {
  pending: {
    label: "Pending",
    variant: "secondary",
    icon: Clock,
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  },
  in_transit: {
    label: "In Transit",
    variant: "default",
    icon: Truck,
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    variant: "default",
    icon: Truck,
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  },
  delivered: {
    label: "Delivered",
    variant: "default",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
  },
  exception: {
    label: "Exception",
    variant: "destructive",
    icon: AlertTriangle,
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
  },
  unknown: {
    label: "Unknown",
    variant: "outline",
    icon: HelpCircle,
    className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800",
  },
};

export function StatusBadge({ status, size = "default" }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, "_");
  const config = statusConfig[normalizedStatus] || statusConfig.unknown;
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={`${config.className} ${size === "sm" ? "text-xs px-2 py-0.5" : "px-3 py-1"} border font-medium`}
      data-testid={`badge-status-${normalizedStatus}`}
    >
      <Icon className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} mr-1.5`} />
      {config.label}
    </Badge>
  );
}
