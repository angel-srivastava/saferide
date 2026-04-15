import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { createRoute } from "@tanstack/react-router";
import { Car, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { RideStatus, RideType } from "../../backend";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { TopBar } from "../../components/layout/TopBar";
import { EmptyState } from "../../components/shared/EmptyState";
import { FareBadge } from "../../components/shared/FareBadge";
import { RatingStars } from "../../components/shared/RatingStars";
import { RideStatusBadge } from "../../components/shared/RideStatusBadge";
import { UserAvatar } from "../../components/shared/UserAvatar";
import { useBackend } from "../../hooks/useBackend";
import { useLandmarks } from "../../hooks/useLandmarks";
import type { RidePublic } from "../../types";
import { Route as rootRoute } from "../__root";

type FilterTab = "all" | "women-only" | "general";

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "women-only", label: "Women Only" },
  { id: "general", label: "General" },
];

function DriverHistoryCard({
  ride,
  landmarks,
  myRating,
}: {
  ride: RidePublic;
  landmarks: { id: bigint; name: string }[];
  myRating: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const pickup =
    landmarks.find((l) => l.id === ride.pickupLandmarkId)?.name ?? "Unknown";
  const dropoff =
    landmarks.find((l) => l.id === ride.dropoffLandmarkId)?.name ?? "Unknown";
  const date = new Date(Number(ride.requestedAt / 1_000_000n));
  const isCompleted = ride.status === RideStatus.Completed;

  return (
    <div
      className="bg-card rounded-2xl shadow-card overflow-hidden"
      data-ocid={`driver-history-${ride.id}`}
    >
      {/* Summary Row */}
      <button
        type="button"
        className="w-full text-left p-4"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-xs font-medium text-muted-foreground truncate">
                {pickup}
              </span>
              <span className="text-muted-foreground/50 shrink-0">→</span>
              <span className="text-xs font-semibold truncate">{dropoff}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <FareBadge farePerPassenger={ride.farePerPassenger} />
              {ride.rideType === RideType.WomenOnly && (
                <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                  Women Only
                </Badge>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <RideStatusBadge status={ride.status} />
            <p className="text-[10px] text-muted-foreground">
              {date.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {isCompleted && myRating > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-xs text-muted-foreground">Your rating:</span>
            <RatingStars rating={myRating} size="sm" />
          </div>
        )}

        <div className="flex items-center justify-end mt-1">
          {expanded ? (
            <ChevronUp size={14} className="text-muted-foreground" />
          ) : (
            <ChevronDown size={14} className="text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded Detail */}
      {expanded && (
        <div className="border-t border-border/40 px-4 pb-4 pt-3 space-y-3 bg-muted/20">
          {/* Route detail */}
          <div className="space-y-1.5">
            <div className="flex items-start gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-1.5" />
              <div>
                <p className="text-[10px] text-muted-foreground">Pickup</p>
                <p className="text-sm font-medium">{pickup}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent shrink-0 mt-1.5" />
              <div>
                <p className="text-[10px] text-muted-foreground">Drop-off</p>
                <p className="text-sm font-medium">{dropoff}</p>
              </div>
            </div>
          </div>

          {/* Trip meta */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-card rounded-lg p-2.5">
              <p className="text-muted-foreground mb-0.5">Passengers</p>
              <p className="font-semibold">{ride.totalPassengers.toString()}</p>
            </div>
            <div className="bg-card rounded-lg p-2.5">
              <p className="text-muted-foreground mb-0.5">Ride Type</p>
              <p className="font-semibold">
                {ride.rideType === RideType.WomenOnly
                  ? "Women Only"
                  : "General"}
              </p>
            </div>
          </div>

          {/* Passenger info */}
          {ride.passengerId && (
            <div className="flex items-center gap-3 bg-card rounded-xl p-3">
              <UserAvatar name="Passenger" size="sm" />
              <div className="min-w-0">
                <p className="text-xs font-semibold">Passenger</p>
                <p className="text-[10px] text-muted-foreground">
                  ID: {ride.passengerId.toText().slice(0, 12)}…
                </p>
              </div>
            </div>
          )}

          {/* Completed time */}
          {ride.completedAt && (
            <p className="text-[10px] text-muted-foreground text-right">
              Completed:{" "}
              {new Date(Number(ride.completedAt / 1_000_000n)).toLocaleString(
                "en-IN",
                {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                },
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function DriverHistoryPage() {
  const { actor, isFetching } = useBackend();
  const { data: landmarks = [] } = useLandmarks();
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  const { data: rides = [], isLoading } = useQuery<RidePublic[]>({
    queryKey: ["driverRideHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDriverRideHistory();
    },
    enabled: !!actor && !isFetching,
  });

  const sorted = [...rides].sort((a, b) =>
    Number(b.requestedAt - a.requestedAt),
  );

  const filtered = sorted.filter((r) => {
    if (activeFilter === "women-only") return r.rideType === RideType.WomenOnly;
    if (activeFilter === "general") return r.rideType === RideType.General;
    return true;
  });

  return (
    <MobileLayout userRole="driver">
      <TopBar title="History" />

      {/* Filter Tabs */}
      <div className="sticky top-0 z-10 bg-background border-b border-border/40 px-4 py-2">
        <div className="flex gap-1.5">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeFilter === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
              data-ocid={`driver-filter-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }, (_, i) => `dh-skel-${i}`).map((k) => (
            <Skeleton key={k} className="h-28 rounded-2xl" />
          ))
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Car size={28} />}
            title={
              activeFilter === "all"
                ? "No trips yet"
                : `No ${activeFilter === "women-only" ? "Women Only" : "General"} trips`
            }
            description={
              activeFilter === "all"
                ? "Accept your first request!"
                : "Try a different filter."
            }
            data-ocid="empty-driver-history"
          />
        ) : (
          filtered.map((ride) => (
            <DriverHistoryCard
              key={ride.id.toString()}
              ride={ride}
              landmarks={landmarks}
              myRating={0}
            />
          ))
        )}
      </div>
    </MobileLayout>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/driver/history",
  component: DriverHistoryPage,
});
