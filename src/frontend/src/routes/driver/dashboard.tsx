import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { createRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Car,
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { RideStatus } from "../../backend";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { TopBar } from "../../components/layout/TopBar";
import { FareBadge } from "../../components/shared/FareBadge";
import { RatingStars } from "../../components/shared/RatingStars";
import { UserAvatar } from "../../components/shared/UserAvatar";
import { useBackend } from "../../hooks/useBackend";
import { useLandmarks } from "../../hooks/useLandmarks";
import { useAuthStore } from "../../store/authStore";
import type { RidePublic } from "../../types";
import { Route as rootRoute } from "../__root";

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-card flex flex-col gap-2 border border-border/40">
      <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
        {icon}
      </div>
      <p className="text-xl font-bold font-display leading-none">{value}</p>
      <p className="text-xs text-muted-foreground leading-none">{label}</p>
    </div>
  );
}

function RecentRideRow({
  ride,
  landmarks,
}: {
  ride: RidePublic;
  landmarks: { id: bigint; name: string }[];
}) {
  const pickup =
    landmarks.find((l) => l.id === ride.pickupLandmarkId)?.name ?? "—";
  const dropoff =
    landmarks.find((l) => l.id === ride.dropoffLandmarkId)?.name ?? "—";
  const date = new Date(Number(ride.requestedAt / 1_000_000n));
  const formatted = date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border/30 last:border-0">
      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
        <Car size={16} className="text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-sm font-medium truncate">
          <span className="truncate">{pickup}</span>
          <ArrowRight size={12} className="shrink-0 text-muted-foreground" />
          <span className="truncate">{dropoff}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{formatted}</p>
      </div>
      <FareBadge farePerPassenger={ride.farePerPassenger} />
    </div>
  );
}

function ActiveRideCard({
  ride,
  landmarks,
  onViewRide,
}: {
  ride: RidePublic;
  landmarks: { id: bigint; name: string }[];
  onViewRide: () => void;
}) {
  const pickup =
    landmarks.find((l) => l.id === ride.pickupLandmarkId)?.name ?? "—";
  const dropoff =
    landmarks.find((l) => l.id === ride.dropoffLandmarkId)?.name ?? "—";

  return (
    <div
      className="rounded-2xl p-4 shadow-safety border border-primary/30 bg-card space-y-3"
      data-ocid="active-ride-card"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">
            Active Ride
          </span>
        </div>
        <FareBadge farePerPassenger={ride.farePerPassenger} />
      </div>
      <div className="space-y-2">
        <div className="flex items-start gap-2.5 text-sm">
          <MapPin size={14} className="text-primary mt-0.5 shrink-0" />
          <span className="font-medium">{pickup}</span>
        </div>
        <div className="flex items-start gap-2.5 text-sm">
          <MapPin size={14} className="text-primary mt-0.5 shrink-0" />
          <span className="font-medium">{dropoff}</span>
        </div>
      </div>
      <Button
        className="w-full h-11 rounded-xl gap-2"
        onClick={onViewRide}
        data-ocid="view-active-ride-btn"
      >
        <Navigation size={16} />
        View Active Ride
      </Button>
    </div>
  );
}

function DriverDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { actor, isFetching } = useBackend();
  const { data: landmarks = [] } = useLandmarks();

  const { data: driverProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["driverProfile", user?.id.toString()],
    queryFn: async () => {
      if (!actor || !user) return null;
      return actor.getDriverProfile(user.id);
    },
    enabled: !!actor && !isFetching && !!user,
  });

  const { data: rideHistory = [], isLoading: historyLoading } = useQuery<
    RidePublic[]
  >({
    queryKey: ["driverHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDriverRideHistory();
    },
    enabled: !!actor && !isFetching,
  });

  const { data: incomingRequests = [], isLoading: requestsLoading } = useQuery<
    RidePublic[]
  >({
    queryKey: ["incomingRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getIncomingRideRequests();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15_000,
  });

  const activeRide = rideHistory.find(
    (r) => r.status === RideStatus.InProgress,
  );
  const completedRides = rideHistory.filter(
    (r) => r.status === RideStatus.Completed,
  );
  const recentRides = completedRides.slice(0, 3);
  const pendingCount = incomingRequests.length;

  const isLoading = profileLoading || historyLoading;

  return (
    <MobileLayout userRole="driver">
      <TopBar title="Driver Dashboard" />

      <div className="px-4 py-5 space-y-5 pb-6">
        {/* Hero greeting */}
        <div className="flex items-center gap-3">
          {user ? (
            <UserAvatar name={user.name} photoUrl={user.photoUrl} size="lg" />
          ) : (
            <Skeleton className="w-14 h-14 rounded-full" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xl font-bold font-display truncate">
                Hello, {user?.name.split(" ")[0] ?? "Driver"}
              </p>
              <Badge className="text-xs px-2 py-0.5 bg-primary/15 text-primary border-primary/30 border rounded-full font-medium">
                Driver
              </Badge>
            </div>
            {isLoading ? (
              <Skeleton className="h-3 w-28 mt-1" />
            ) : driverProfile ? (
              <div className="flex items-center gap-1.5 mt-1">
                <RatingStars rating={driverProfile.avgRating} size="sm" />
                <span className="text-xs text-muted-foreground">
                  {driverProfile.avgRating.toFixed(1)}
                </span>
              </div>
            ) : null}
          </div>
          {/* Verification status */}
          {!isLoading && (
            <div className="shrink-0">
              {driverProfile?.isVerified ? (
                <div className="flex items-center gap-1 text-xs text-primary bg-primary/10 border border-primary/25 px-2.5 py-1.5 rounded-xl font-medium">
                  <CheckCircle2 size={13} />
                  Verified
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-accent bg-accent/10 border border-accent/25 px-2.5 py-1.5 rounded-xl font-medium">
                  <Clock size={13} />
                  Pending
                </div>
              )}
            </div>
          )}
        </div>

        {/* Active ride (if any) */}
        {!historyLoading && activeRide && (
          <ActiveRideCard
            ride={activeRide}
            landmarks={landmarks}
            onViewRide={() => navigate({ to: "/driver/active-ride" })}
          />
        )}

        {/* Incoming requests summary */}
        <div
          className="bg-card rounded-2xl p-4 shadow-card border border-border/40 flex items-center justify-between gap-4"
          data-ocid="requests-summary-card"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Users size={18} className="text-primary" />
            </div>
            <div>
              {requestsLoading ? (
                <Skeleton className="h-5 w-16 mb-1" />
              ) : (
                <p className="text-2xl font-bold font-display leading-none">
                  {pendingCount}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Pending requests
              </p>
            </div>
          </div>
          <Button
            className="rounded-xl h-10 gap-1.5 shrink-0"
            onClick={() => navigate({ to: "/driver/requests" })}
            data-ocid="view-requests-cta"
          >
            View Requests
            <ArrowRight size={15} />
          </Button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<Car size={18} className="text-primary" />}
            label="Total Rides"
            value={
              isLoading ? "—" : (driverProfile?.totalRides.toString() ?? "0")
            }
          />
          <StatCard
            icon={<Star size={18} className="text-accent" />}
            label="Avg Rating"
            value={
              isLoading
                ? "—"
                : driverProfile
                  ? driverProfile.avgRating.toFixed(1)
                  : "—"
            }
          />
        </div>

        {/* Recent rides */}
        <div className="bg-card rounded-2xl shadow-card border border-border/40 overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" />
              <h2 className="text-sm font-semibold">Recent Rides</h2>
            </div>
            {completedRides.length > 3 && (
              <button
                type="button"
                onClick={() => navigate({ to: "/driver/history" })}
                className="text-xs text-primary font-medium hover:underline"
              >
                See all
              </button>
            )}
          </div>
          <div className="px-4 pb-3">
            {historyLoading ? (
              Array.from({ length: 3 }, (_, i) => `skel-${i}`).map((k) => (
                <div
                  key={k}
                  className="py-3 border-b border-border/30 last:border-0"
                >
                  <Skeleton className="h-4 w-full mb-1.5" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))
            ) : recentRides.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <Car size={24} className="text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No completed rides yet
                </p>
              </div>
            ) : (
              recentRides.map((ride) => (
                <RecentRideRow
                  key={ride.id.toString()}
                  ride={ride}
                  landmarks={landmarks}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/driver/dashboard",
  component: DriverDashboardPage,
});
