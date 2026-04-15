import { cn } from "@/lib/utils";

interface FareBadgeProps {
  farePerPassenger: number;
  totalFare?: number;
  passengers?: number;
  large?: boolean;
  className?: string;
}

export function FareBadge({
  farePerPassenger,
  totalFare,
  passengers,
  large,
  className,
}: FareBadgeProps) {
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(farePerPassenger);

  return (
    <div className={cn("flex flex-col items-start", className)}>
      <span
        className={cn(
          "font-bold font-display text-foreground leading-none",
          large ? "text-3xl" : "text-xl",
        )}
      >
        {formatted}
      </span>
      {(totalFare !== undefined || passengers !== undefined) && (
        <span className="text-xs text-muted-foreground mt-0.5">
          {passengers !== undefined && "per passenger · "}
          {totalFare !== undefined && `Total \u20B9${Math.round(totalFare)}`}
        </span>
      )}
    </div>
  );
}
