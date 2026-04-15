import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  MapPin,
  RefreshCw,
  Shield,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RideType } from "../../backend";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { TopBar } from "../../components/layout/TopBar";
import { EmptyState } from "../../components/shared/EmptyState";
import { FareBadge } from "../../components/shared/FareBadge";
import { RatingStars } from "../../components/shared/RatingStars";
import { RideStatusBadge } from "../../components/shared/RideStatusBadge";
import { UserAvatar } from "../../components/shared/UserAvatar";
import { useBackend } from "../../hooks/useBackend";
import { useCurrentRideStore } from "../../hooks/useCurrentRide";
import { useLandmarks } from "../../hooks/useLandmarks";
import type { RidePublic } from "../../types";
import { Route as rootRoute } from "../__root";

type TabFilter = "all" | "women-only" | "general";

const tabLabels: { key: TabFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "women-only", label: "Women Only" },
  { key: "general", label: "General" },
];

function RequestCard({
  ride,
  landmarks,
  onAccept,
  onReject,
  isAccepting,
  isRejecting,
  isRejected,
  passengerInfo,
}: {
  ride: RidePublic;
  landmarks: { id: bigint; name: string }[];
  onAccept: () => void;
  onReject: () => void;
  isAccepting: boolean;
  isRejecting: boolean;
  isRejected: boolean;
  passengerInfo: { name: string; photoUrl: string; avgRating: number } | null;
}) {
  const pickup =
    landmarks.find((l) => l.id === ride.pickupLandmarkId)?.name ?? "Unknown";
  const dropoff =
    landmarks.find((l) => l.id === ride.dropoffLandmarkId)?.name ?? "Unknown";
  const isWomenOnly = ride.rideType === RideType.WomenOnly;

  return (
    <div
      className={cn(
        "bg-card rounded-2xl shadow-card border border-border/40 overflow-hidden transition-all duration-300",
        isRejected && "opacity-0 scale-95 pointer-events-none",
      )}
      data-ocid={`request-card-${ride.id}`}
    >
      {/* Ride type accent bar */}
      <div
        className={cn("h-1 w-full", isWomenOnly ? "bg-pink-400" : "bg-primary")}
      />

      <div className="p-4 space-y-3.5">
        {/* Header: passenger info + badges */}
        <div className="flex items-start gap-3">
          <UserAvatar
            name={passengerInfo?.name ?? "Passenger"}
            photoUrl={passengerInfo?.photoUrl}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">
              {passengerInfo?.name ?? "Loading…"}
            </p>
            {passengerInfo && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <RatingStars rating={passengerInfo.avgRating} size="sm" />
                <span className="text-xs text-muted-foreground">
                  {passengerInfo.avgRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <RideStatusBadge status={ride.status} />
            {isWomenOnly && (
              <Badge className="text-[10px] px-1.5 py-0 bg-pink-400/15 text-pink-400 border-pink-400/30 border rounded-full font-medium flex items-center gap-0.5">
                <Shield size={9} />
                Women Only
              </Badge>
            )}
          </div>
        </div>

        {/* Route */}
        <div className="bg-muted/50 rounded-xl p-3 space-y-2">
          <div className="flex items-start gap-2.5 text-sm">
            <div className="mt-0.5 shrink-0 w-3 h-3 rounded-full bg-primary border-2 border-primary" />
            <p className="font-medium leading-snug">{pickup}</p>
          </div>
          <div className="flex items-start gap-2.5 text-sm ml-0.5">
            <ArrowRight
              size={11}
              className="text-muted-foreground mt-0.5 shrink-0"
            />
            <p className="text-muted-foreground text-xs leading-snug">to</p>
          </div>
          <div className="flex items-start gap-2.5 text-sm">
            <MapPin size={13} className="text-primary mt-0.5 shrink-0" />
            <p className="font-medium leading-snug">{dropoff}</p>
          </div>
        </div>

        {/* Meta row: passengers + fare */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted/50 px-2.5 py-1.5 rounded-lg">
            <Users size={13} />
            <span>
              {ride.totalPassengers.toString()} passenger
              {ride.totalPassengers > 1n ? "s" : ""}
            </span>
          </div>
          <FareBadge
            farePerPassenger={ride.farePerPassenger}
            passengers={Number(ride.totalPassengers)}
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-0.5">
          <Button
            variant="outline"
            className="flex-1 h-11 rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10 font-medium gap-1.5"
            onClick={onReject}
            disabled={isAccepting || isRejecting}
            data-ocid={`reject-btn-${ride.id}`}
          >
            <X size={15} />
            Decline
          </Button>
          <Button
            className="flex-1 h-11 rounded-xl font-semibold gap-1.5"
            onClick={onAccept}
            disabled={isAccepting || isRejecting}
            data-ocid={`accept-btn-${ride.id}`}
          >
            {isAccepting ? (
              <RefreshCw size={15} className="animate-spin" />
            ) : (
              <Check size={15} />
            )}
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}

function PassengerInfoLoader({
  ride,
  landmarks,
  onAccept,
  onReject,
  isAccepting,
  isRejecting,
  isRejected,
}: {
  ride: RidePublic;
  landmarks: { id: bigint; name: string }[];
  onAccept: () => void;
  onReject: () => void;
  isAccepting: boolean;
  isRejecting: boolean;
  isRejected: boolean;
}) {
  const { actor, isFetching } = useBackend();

  const { data: userInfo } = useQuery({
    queryKey: ["user", ride.passengerId.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUser(ride.passengerId);
    },
    enabled: !!actor && !isFetching,
  });

  const { data: passengerProfile } = useQuery({
    queryKey: ["passengerProfile", ride.passengerId.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPassengerProfile(ride.passengerId);
    },
    enabled: !!actor && !isFetching,
  });

  const passengerInfo = userInfo
    ? {
        name: userInfo.name,
        photoUrl: userInfo.photoUrl,
        avgRating: passengerProfile?.avgRating ?? 0,
      }
    : null;

  return (
    <RequestCard
      ride={ride}
      landmarks={landmarks}
      onAccept={onAccept}
      onReject={onReject}
      isAccepting={isAccepting}
      isRejecting={isRejecting}
      isRejected={isRejected}
      passengerInfo={passengerInfo}
    />
  );
}

function DriverRequestsPage() {
  const navigate = useNavigate();
  const { actor, isFetching } = useBackend();
  const qc = useQueryClient();
  const { setActiveRideId } = useCurrentRideStore();
  const { data: landmarks = [] } = useLandmarks();
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set());
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const {
    data: requests = [],
    isLoading,
    refetch,
    isFetching: isRefetching,
  } = useQuery<RidePublic[]>({
    queryKey: ["incomingRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getIncomingRideRequests();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10_000,
  });

  const acceptMutation = useMutation({
    mutationFn: async (rideId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.acceptRide(rideId);
    },
    onMutate: (rideId) => {
      setAcceptingId(rideId.toString());
    },
    onSuccess: (ride) => {
      setActiveRideId(ride.id);
      qc.invalidateQueries({ queryKey: ["incomingRequests"] });
      toast.success("Ride accepted! Head to the pickup point.");
      navigate({ to: "/driver/active-ride" });
    },
    onError: () => {
      toast.error("Failed to accept ride. Please try again.");
      setAcceptingId(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (rideId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.rejectRide(rideId);
    },
    onMutate: (rideId) => {
      setRejectingId(rideId.toString());
      // Optimistic: add to rejected set for fade-out
      setRejectedIds((prev) => new Set([...prev, rideId.toString()]));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["incomingRequests"] });
      toast.info("Ride declined.");
      setRejectingId(null);
    },
    onError: (_err, rideId) => {
      // Rollback optimistic
      setRejectedIds((prev) => {
        const next = new Set(prev);
        next.delete(rideId.toString());
        return next;
      });
      toast.error("Failed to decline ride.");
      setRejectingId(null);
    },
  });

  const filteredRequests = requests.filter((r) => {
    if (activeTab === "women-only") return r.rideType === RideType.WomenOnly;
    if (activeTab === "general") return r.rideType === RideType.General;
    return true;
  });

  return (
    <MobileLayout userRole="driver">
      <TopBar
        title="Ride Requests"
        action={
          <button
            type="button"
            onClick={() => refetch()}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="Refresh requests"
            data-ocid="refresh-requests-btn"
          >
            <RefreshCw
              size={17}
              className={cn(
                "text-muted-foreground transition-transform duration-500",
                isRefetching && "animate-spin",
              )}
            />
          </button>
        }
      />

      {/* Tab filter */}
      <div className="px-4 pt-3 pb-1">
        <div
          className="flex gap-1 bg-muted/50 rounded-xl p-1"
          role="tablist"
          aria-label="Filter requests"
        >
          {tabLabels.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={activeTab === key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "flex-1 text-xs font-medium py-2 px-2 rounded-lg transition-all duration-200",
                activeTab === key
                  ? "bg-card text-foreground shadow-card"
                  : "text-muted-foreground hover:text-foreground",
              )}
              data-ocid={`tab-filter-${key}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Request count */}
      {!isLoading && filteredRequests.length > 0 && (
        <div className="px-4 pt-2 pb-1">
          <p className="text-xs text-muted-foreground">
            {filteredRequests.length} request
            {filteredRequests.length !== 1 ? "s" : ""} waiting
          </p>
        </div>
      )}

      {/* List */}
      <div className="px-4 py-3 space-y-3 pb-6">
        {isLoading ? (
          Array.from({ length: 2 }, (_, i) => `req-skel-${i}`).map((k) => (
            <div
              key={k}
              className="bg-card rounded-2xl shadow-card border border-border/40 overflow-hidden"
            >
              <div className="h-1 bg-primary/30 w-full" />
              <div className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-28 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-20 rounded-xl" />
                <div className="flex gap-2">
                  <Skeleton className="flex-1 h-11 rounded-xl" />
                  <Skeleton className="flex-1 h-11 rounded-xl" />
                </div>
              </div>
            </div>
          ))
        ) : filteredRequests.length === 0 ? (
          <EmptyState
            icon={<MapPin size={28} />}
            title="No ride requests"
            description="New requests will appear here. Pull to refresh."
            action={
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-xl"
                onClick={() => refetch()}
                data-ocid="empty-refresh-btn"
              >
                <RefreshCw size={14} />
                Refresh
              </Button>
            }
            data-ocid="empty-requests"
          />
        ) : (
          filteredRequests.map((ride) => (
            <PassengerInfoLoader
              key={ride.id.toString()}
              ride={ride}
              landmarks={landmarks}
              onAccept={() => acceptMutation.mutate(ride.id)}
              onReject={() => rejectMutation.mutate(ride.id)}
              isAccepting={acceptingId === ride.id.toString()}
              isRejecting={rejectingId === ride.id.toString()}
              isRejected={rejectedIds.has(ride.id.toString())}
            />
          ))
        )}
      </div>
    </MobileLayout>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/driver/requests",
  component: DriverRequestsPage,
});
