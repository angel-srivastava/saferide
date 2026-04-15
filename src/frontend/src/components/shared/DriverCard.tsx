import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";
import type { AvailableDriver } from "../../types";
import { RatingStars } from "./RatingStars";
import { UserAvatar } from "./UserAvatar";

interface DriverCardProps {
  driver: AvailableDriver;
  selected?: boolean;
  onSelect?: () => void;
  className?: string;
  "data-ocid"?: string;
}

export function DriverCard({
  driver,
  selected,
  onSelect,
  className,
  "data-ocid": ocid,
}: DriverCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      data-ocid={ocid}
      className={`w-full text-left p-4 rounded-2xl transition-all duration-200 border-2 ${
        selected
          ? "border-primary bg-primary/10 shadow-elevated"
          : "border-border/50 bg-card hover:border-primary/40 hover:shadow-card"
      } ${className ?? ""}`}
    >
      <div className="flex items-start gap-3">
        <UserAvatar name={driver.name} photoUrl={driver.photoUrl} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm truncate">
              {driver.name}
            </span>
            {driver.isVerified && (
              <Badge
                variant="outline"
                className="text-primary border-primary/40 text-[10px] py-0 px-1.5 flex items-center gap-1"
              >
                <ShieldCheck size={10} />
                Verified
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <RatingStars rating={driver.avgRating} size="sm" />
            <span className="text-xs text-muted-foreground">
              {driver.avgRating.toFixed(1)} · {driver.totalRides.toString()}{" "}
              rides
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-mono tracking-wide">
            {driver.vehicleNumber}
          </p>
        </div>
      </div>
    </button>
  );
}
