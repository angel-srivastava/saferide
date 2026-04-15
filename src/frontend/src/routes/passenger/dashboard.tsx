import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { createRoute, useNavigate } from "@tanstack/react-router";
import {
  Car,
  ChevronRight,
  MapPin,
  Shield,
  Star,
  TrendingUp,
} from "lucide-react";
import { RideStatus } from "../../backend";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { FareBadge } from "../../components/shared/FareBadge";
import { RideStatusBadge } from "../../components/shared/RideStatusBadge";
import { UserAvatar } from "../../components/shared/UserAvatar";
import { useBackend } from "../../hooks/useBackend";
import { useCurrentRide } from "../../hooks/useCurrentRide";
import { useLandmarks } from "../../hooks/useLandmarks";
import { useAuthStore } from "../../store/authStore";
import type { RidePublic } from "../../types";
import { Route as rootRoute } from "../__root";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const ACTIVE_STATUSES = [
  RideStatus.Requested,
  RideStatus.Accepted,
  RideStatus.InProgress,
];

interface MiniRideRowProps {
  ride: RidePublic;
  pickupName: string;
  dropoffName: string;
}

function MiniRideRow({ ride, pickupName, dropoffName }: MiniRideRowProps) {
  const date = new Date(Number(ride.requestedAt / 1_000_000n));
  return (
    <div
      className="flex items-center justify-between gap-3 py-3 border-b border-border/40 last:border-0"
      data-ocid={`recent-ride-${ride.id}`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <Car size={14} className="text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {pickupName} → {dropoffName}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {date.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })}
          </p>
        </div>
      </div>
      <FareBadge farePerPassenger={ride.farePerPassenger} />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex-1 bg-card rounded-2xl p-4 shadow-card flex flex-col gap-2">
      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <p className="text-xl font-bold font-display text-foreground leading-none">
        {value}
      </p>
      <p className="text-xs text-muted-foreground leading-tight">{label}</p>
    </div>
  );
}

function DashboardPage() {
  const navigate = useNavigate();
  const { actor, isFetching } = useBackend();
  const user = useAuthStore((s) => s.user);
  const { data: landmarks = [] } = useLandmarks();
  const { data: activeRide } = useCurrentRide();

  const { data: history = [], isLoading: historyLoading } = useQuery<
    RidePublic[]
  >({
    queryKey: ["myRideHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyRideHistory();
    },
    enabled: !!actor && !isFetching,
  });

  const { data: passengerProfile } = useQuery({
    queryKey: ["myPassengerProfile", user?.id.toString()],
    queryFn: async () => {
      if (!actor || !user) return null;
      return actor.getPassengerProfile(user.id);
    },
    enabled: !!actor && !isFetching && !!user,
  });

  const completedRides = history.filter(
    (r) => r.status === RideStatus.Completed,
  );
  const recentRides = [...completedRides]
    .sort((a, b) => Number(b.requestedAt - a.requestedAt))
    .slice(0, 3);

  const getLandmarkName = (id: bigint) =>
    landmarks.find((l) => l.id === id)?.name ?? "...";

  const isActiveRide =
    activeRide && ACTIVE_STATUSES.includes(activeRide.status);

  return (
    <MobileLayout userRole="passenger">
      {/* Header zone */}
      <div className="bg-card border-b border-border/50 px-5 pt-6 pb-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{getGreeting()},</p>
            <h1 className="text-xl font-bold font-display text-foreground truncate mt-0.5">
              {user?.name ?? "Passenger"} 👋
            </h1>
          </div>
          <UserAvatar
            name={user?.name ?? "P"}
            photoUrl={user?.photoUrl}
            size="lg"
          />
        </div>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* Active ride */}
        {isActiveRide && (
          <div
            className="bg-primary/10 border border-primary/30 rounded-2xl p-4 shadow-card"
            data-ocid="active-ride-card"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-primary">
                Active Ride
              </span>
              <RideStatusBadge status={activeRide.status} />
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-start gap-2 text-sm">
                <span className="text-green-400 mt-1.5 shrink-0 leading-none">
                  ●
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Pickup</p>
                  <p className="font-medium truncate">
                    {getLandmarkName(activeRide.pickupLandmarkId)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-primary mt-1.5 shrink-0 leading-none">
                  ●
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Drop-off</p>
                  <p className="font-medium truncate">
                    {getLandmarkName(activeRide.dropoffLandmarkId)}
                  </p>
                </div>
              </div>
            </div>
            <Button
              className="w-full h-11 rounded-xl"
              onClick={() => navigate({ to: "/passenger/active-ride" })}
              data-ocid="view-ride-btn"
            >
              View Ride
            </Button>
          </div>
        )}

        {/* Book CTA */}
        <button
          type="button"
          className="w-full bg-primary text-primary-foreground rounded-2xl p-5 flex items-center justify-between shadow-safety transition-smooth hover:bg-primary/90 active:scale-[0.98] min-h-[80px]"
          onClick={() => navigate({ to: "/passenger/book" })}
          data-ocid="book-ride-cta"
        >
          <div className="text-left">
            <p className="text-xs font-medium opacity-80">Ready to go?</p>
            <p className="text-lg font-bold font-display mt-0.5">Book a Ride</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
            <Car size={24} className="text-primary-foreground" />
          </div>
        </button>

        {/* Stats */}
        <div className="flex gap-3">
          <StatCard
            label="Rides Completed"
            value={historyLoading ? "—" : completedRides.length.toString()}
            icon={<TrendingUp size={16} />}
          />
          <StatCard
            label="Average Rating"
            value={
              passengerProfile && passengerProfile.avgRating > 0
                ? `${passengerProfile.avgRating.toFixed(1)} ★`
                : "—"
            }
            icon={<Star size={16} />}
          />
        </div>

        {/* Recent rides */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground">
              Recent Rides
            </h2>
            <button
              type="button"
              className="flex items-center gap-1 text-xs text-primary font-medium min-h-[44px]"
              onClick={() => navigate({ to: "/passenger/history" })}
              data-ocid="view-history-link"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="bg-card rounded-2xl px-4 shadow-card">
            {historyLoading ? (
              <div className="py-3 space-y-3">
                {["s1", "s2", "s3"].map((k) => (
                  <Skeleton key={k} className="h-14 rounded-xl" />
                ))}
              </div>
            ) : recentRides.length === 0 ? (
              <div className="py-8 text-center">
                <MapPin
                  size={28}
                  className="text-muted-foreground mx-auto mb-2"
                />
                <p className="text-sm text-muted-foreground">No rides yet</p>
              </div>
            ) : (
              recentRides.map((ride) => (
                <MiniRideRow
                  key={ride.id.toString()}
                  ride={ride}
                  pickupName={getLandmarkName(ride.pickupLandmarkId)}
                  dropoffName={getLandmarkName(ride.dropoffLandmarkId)}
                />
              ))
            )}
          </div>
        </div>

        {/* Safety tip */}
        <div
          className="bg-secondary/20 border border-secondary/30 rounded-2xl p-4 flex gap-3 items-start"
          data-ocid="safety-tip-card"
        >
          <div className="w-9 h-9 rounded-xl bg-secondary/30 flex items-center justify-center shrink-0 mt-0.5">
            <Shield size={18} className="text-secondary-foreground" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground mb-1">
              Safety Tip
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Always verify the vehicle number before boarding. Tap SOS anytime
              if you feel unsafe.
            </p>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/passenger/dashboard",
  component: DashboardPage,
});
