import { cn } from "@/lib/utils";
import { RideStatus } from "../../backend";

interface RideStatusBadgeProps {
  status: RideStatus;
  className?: string;
}

const statusConfig: Record<RideStatus, { label: string; className: string }> = {
  [RideStatus.Requested]: {
    label: "Requested",
    className: "bg-accent/15 text-accent border-accent/30",
  },
  [RideStatus.Accepted]: {
    label: "Accepted",
    className: "bg-primary/15 text-primary border-primary/30",
  },
  [RideStatus.InProgress]: {
    label: "In Progress",
    className: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  [RideStatus.Completed]: {
    label: "Completed",
    className: "bg-green-500/15 text-green-400 border-green-500/30",
  },
  [RideStatus.Cancelled]: {
    label: "Cancelled",
    className: "bg-destructive/15 text-destructive border-destructive/30",
  },
};

export function RideStatusBadge({ status, className }: RideStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
