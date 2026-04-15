import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createRoute, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock,
  MapPin,
  Navigation,
  Phone,
  Share2,
  Shield,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RideStatus } from "../../backend";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { TopBar } from "../../components/layout/TopBar";
import { EmptyState } from "../../components/shared/EmptyState";
import { FareBadge } from "../../components/shared/FareBadge";
import { RatingStars } from "../../components/shared/RatingStars";
import { RideStatusBadge } from "../../components/shared/RideStatusBadge";
import { UserAvatar } from "../../components/shared/UserAvatar";
import { useBackend } from "../../hooks/useBackend";
import {
  useCurrentRide,
  useCurrentRideStore,
} from "../../hooks/useCurrentRide";
import { useLandmarks } from "../../hooks/useLandmarks";
import type { Landmark } from "../../types";
import { Route as rootRoute } from "../__root";

// ── Static Map ──────────────────────────────────────────────────────────────

function StaticRideMap({
  pickup,
  dropoff,
  status,
}: {
  pickup: Landmark | undefined;
  dropoff: Landmark | undefined;
  status: RideStatus;
}) {
  const minLat = 28.4;
  const maxLat = 28.75;
  const minLng = 77.0;
  const maxLng = 77.4;

  function toXY(lat: number, lng: number) {
    const x = ((lng - minLng) / (maxLng - minLng)) * 84 + 8;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 74 + 8;
    return { x, y };
  }

  const pCoord = pickup
    ? toXY(pickup.latitude, pickup.longitude)
    : { x: 20, y: 65 };
  const dCoord = dropoff
    ? toXY(dropoff.latitude, dropoff.longitude)
    : { x: 75, y: 30 };

  const isInProgress = status === RideStatus.InProgress;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-card border border-border/30 h-44">
      <svg
        viewBox="0 0 100 90"
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      >
        {[20, 40, 60, 80].map((v) => (
          <line
            key={`h-${v}`}
            x1="5"
            y1={v}
            x2="95"
            y2={v}
            stroke="oklch(1 0 0 / 0.04)"
            strokeWidth="0.4"
          />
        ))}
        {[20, 40, 60, 80].map((v) => (
          <line
            key={`v-${v}`}
            x1={v}
            y1="5"
            x2={v}
            y2="85"
            stroke="oklch(1 0 0 / 0.04)"
            strokeWidth="0.4"
          />
        ))}

        <line
          x1={pCoord.x}
          y1={pCoord.y}
          x2={dCoord.x}
          y2={dCoord.y}
          stroke={isInProgress ? "oklch(0.78 0.14 75)" : "oklch(0.72 0.14 195)"}
          strokeWidth="1.2"
          strokeDasharray="3,2"
          strokeLinecap="round"
        />

        {/* Pickup pin */}
        <circle
          cx={pCoord.x}
          cy={pCoord.y}
          r="4"
          fill="oklch(0.72 0.14 195)"
          opacity="0.25"
        />
        <circle
          cx={pCoord.x}
          cy={pCoord.y}
          r="2.2"
          fill="oklch(0.72 0.14 195)"
        />

        {/* Dropoff pin */}
        <circle
          cx={dCoord.x}
          cy={dCoord.y}
          r="4"
          fill="oklch(0.78 0.14 75)"
          opacity="0.25"
        />
        <circle
          cx={dCoord.x}
          cy={dCoord.y}
          r="2.2"
          fill="oklch(0.78 0.14 75)"
        />
      </svg>

      <div className="absolute bottom-2 left-3 flex items-center gap-1.5 text-[10px] text-foreground/60">
        <span className="w-2 h-2 rounded-full bg-primary inline-block" />
        <span className="truncate max-w-[80px]">
          {pickup?.name ?? "Pickup"}
        </span>
      </div>
      <div className="absolute bottom-2 right-3 flex items-center gap-1.5 text-[10px] text-foreground/60">
        <span className="w-2 h-2 rounded-full bg-accent inline-block" />
        <span className="truncate max-w-[80px]">
          {dropoff?.name ?? "Drop-off"}
        </span>
      </div>

      <div className="absolute top-2 right-3 text-[9px] text-foreground/30 font-mono uppercase tracking-wider">
        SafeRide Map
      </div>
    </div>
  );
}

// ── Trip Timeline ───────────────────────────────────────────────────────────

const TIMELINE_STEPS = [
  { key: RideStatus.Requested, label: "Ride requested" },
  { key: RideStatus.Accepted, label: "Heading to pickup" },
  { key: RideStatus.InProgress, label: "Trip in progress" },
  { key: RideStatus.Completed, label: "Trip completed" },
];

function TripTimeline({ status }: { status: RideStatus }) {
  const currentIdx = TIMELINE_STEPS.findIndex((s) => s.key === status);
  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Trip Progress
      </p>
      <div className="space-y-2.5">
        {TIMELINE_STEPS.map((step, idx) => {
          const done = idx < currentIdx;
          const active = idx === currentIdx;
          return (
            <div key={step.key} className="flex items-center gap-3">
              <div className="shrink-0">
                {done ? (
                  <CheckCircle2 size={16} className="text-primary" />
                ) : active ? (
                  <Clock size={16} className="text-accent animate-pulse" />
                ) : (
                  <Circle size={16} className="text-border" />
                )}
              </div>
              <span
                className={`text-sm leading-tight ${
                  active
                    ? "text-foreground font-semibold"
                    : done
                      ? "text-muted-foreground"
                      : "text-border"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── SOS Modal ───────────────────────────────────────────────────────────────

function SOSModal({
  open,
  onClose,
  pickupName,
  dropoffName,
}: {
  open: boolean;
  onClose: () => void;
  pickupName: string;
  dropoffName: string;
}) {
  if (!open) return null;

  function handleShareEmergency() {
    const msg = `🚨 EMERGENCY: I'm a SafeRide driver on a trip from ${pickupName} to ${dropoffName}. Please check on me immediately.`;
    navigator.clipboard
      .writeText(msg)
      .then(() => toast.success("Emergency info copied to clipboard"));
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center"
      data-ocid="sos-modal"
    >
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={-1}
        aria-label="Close"
      />
      <div className="relative z-10 w-full max-w-md bg-card border border-destructive/30 rounded-t-3xl p-6 space-y-4 shadow-[0_-8px_32px_oklch(0_0_0/0.3)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-destructive" />
            <h2 className="text-lg font-bold text-destructive">
              Are you safe?
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-muted transition-colors"
            aria-label="Dismiss"
            data-ocid="sos-dismiss"
          >
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">Help is available 24/7.</p>

        <a
          href="tel:911"
          className="flex items-center gap-3 w-full bg-destructive text-destructive-foreground rounded-2xl px-4 py-3.5 font-semibold text-sm hover:opacity-90 transition-opacity"
          data-ocid="sos-call-911"
        >
          <Phone size={18} />
          Call 911 — Emergency Services
        </a>

        <button
          type="button"
          onClick={handleShareEmergency}
          className="flex items-center gap-3 w-full bg-accent/20 border border-accent/40 text-foreground rounded-2xl px-4 py-3.5 font-semibold text-sm hover:bg-accent/30 transition-colors"
          data-ocid="sos-share-emergency"
        >
          <Share2 size={18} />
          Share with Emergency Contacts
        </button>

        <button
          type="button"
          onClick={() => {
            toast.info("SafeRide Support: +1-800-SAFERIDE (available 24/7)");
            onClose();
          }}
          className="flex items-center gap-3 w-full bg-muted border border-border/50 text-foreground rounded-2xl px-4 py-3.5 font-semibold text-sm hover:bg-muted/80 transition-colors"
          data-ocid="sos-support"
        >
          <Shield size={18} />
          Contact SafeRide Support
        </button>
      </div>
    </div>
  );
}

// ── Passenger Rating Modal ──────────────────────────────────────────────────

function PassengerRatingModal({
  open,
  rideId,
  passengerId,
  passengerName,
  passengerPhoto,
  onDone,
}: {
  open: boolean;
  rideId: bigint;
  passengerId: string;
  passengerName: string;
  passengerPhoto: string;
  onDone: () => void;
}) {
  const { actor } = useBackend();
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      const { Principal } = await import("@icp-sdk/core/principal");
      await actor.submitRating({
        rideId,
        toUserId: Principal.fromText(passengerId),
        score: BigInt(stars),
        comment: comment.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast.success("Rating submitted!");
      onDone();
    },
    onError: () => toast.error("Failed to submit rating."),
  });

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center"
      data-ocid="passenger-rating-modal"
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md bg-card border border-border/50 rounded-t-3xl p-6 space-y-5 shadow-[0_-8px_32px_oklch(0_0_0/0.25)]">
        <div className="text-center">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Trip Completed
          </p>
          <h2 className="text-xl font-bold">Rate Your Passenger</h2>
        </div>

        <div className="flex flex-col items-center gap-2">
          <UserAvatar
            name={passengerName}
            photoUrl={passengerPhoto}
            size="xl"
          />
          <p className="font-semibold text-base">{passengerName}</p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">
            How was your passenger?
          </p>
          <RatingStars
            rating={stars}
            interactive
            onChange={setStars}
            size="lg"
            data-ocid="passenger-rating-stars"
          />
        </div>

        <Textarea
          placeholder="Add a comment (optional)"
          maxLength={200}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="resize-none h-20 text-sm"
          data-ocid="passenger-rating-comment"
        />
        <p className="text-xs text-muted-foreground text-right -mt-3">
          {comment.length}/200
        </p>

        <Button
          className="w-full h-12 rounded-2xl font-semibold"
          onClick={() => mutation.mutate()}
          disabled={stars === 0 || mutation.isPending}
          data-ocid="submit-passenger-rating-btn"
        >
          {mutation.isPending ? "Submitting..." : "Submit Rating"}
        </Button>

        <button
          type="button"
          onClick={onDone}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
          data-ocid="skip-passenger-rating-btn"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

function DriverActiveRidePage() {
  const navigate = useNavigate();
  const { actor } = useBackend();
  const qc = useQueryClient();
  const { data: ride, activeRideId } = useCurrentRide();
  const { setActiveRideId } = useCurrentRideStore();
  const { data: landmarks = [] } = useLandmarks();

  const [sosOpen, setSosOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);

  const pickupLandmark = landmarks.find(
    (l) => ride && l.id === ride.pickupLandmarkId,
  );
  const dropoffLandmark = landmarks.find(
    (l) => ride && l.id === ride.dropoffLandmarkId,
  );

  // Fetch passenger profile
  const { data: passengerUser } = useQuery({
    queryKey: ["passengerUser", ride?.passengerId?.toText()],
    queryFn: async () => {
      if (!actor || !ride?.passengerId) return null;
      return actor.getUser(ride.passengerId);
    },
    enabled: !!actor && !!ride?.passengerId,
  });

  const markPickupMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !activeRideId) throw new Error("No active ride");
      return actor.markPickup(activeRideId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["currentRide"] });
      toast.success("Passenger picked up! Trip started.");
    },
    onError: () => toast.error("Failed to mark pickup."),
  });

  const markDropoffMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !activeRideId) throw new Error("No active ride");
      return actor.markDropoff(activeRideId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["currentRide"] });
      toast.success("Trip completed!");
      setRatingOpen(true);
    },
    onError: () => toast.error("Failed to mark dropoff."),
  });

  function handleRatingDone() {
    setRatingOpen(false);
    setActiveRideId(null);
    qc.invalidateQueries({ queryKey: ["driverRideHistory"] });
    navigate({ to: "/driver/dashboard" });
  }

  if (!activeRideId || !ride) {
    return (
      <MobileLayout userRole="driver">
        <TopBar title="Active Ride" />
        <EmptyState
          icon={<Navigation size={28} />}
          title="No active ride"
          description="Accept a ride request to start driving"
          action={
            <Button
              onClick={() => navigate({ to: "/driver/requests" })}
              data-ocid="view-requests-cta"
            >
              View Requests
            </Button>
          }
          data-ocid="empty-active-ride-driver"
        />
      </MobileLayout>
    );
  }

  const passengerName = passengerUser?.name ?? "Passenger";
  const passengerPhoto = passengerUser?.photoUrl ?? "";
  const passengerIdStr = ride.passengerId?.toText() ?? "";

  return (
    <MobileLayout userRole="driver">
      <TopBar title="Active Ride" />

      <div className="px-4 pt-4 pb-6 space-y-3">
        {/* Static Map */}
        <StaticRideMap
          pickup={pickupLandmark}
          dropoff={dropoffLandmark}
          status={ride.status}
        />

        {/* Passenger Info Card */}
        <div className="bg-card rounded-2xl p-4 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserAvatar
                name={passengerName}
                photoUrl={passengerPhoto}
                size="md"
              />
              <div>
                <p className="font-semibold text-sm leading-tight">
                  {passengerName}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Users size={11} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {ride.totalPassengers.toString()} passenger(s)
                  </span>
                </div>
              </div>
            </div>
            <RideStatusBadge status={ride.status} />
          </div>

          <div className="flex items-center gap-2 text-sm min-w-0">
            <div className="flex items-center gap-1 min-w-0">
              <MapPin size={12} className="text-primary shrink-0" />
              <span className="truncate text-xs font-medium">
                {pickupLandmark?.name ?? "Pickup"}
              </span>
            </div>
            <span className="text-muted-foreground shrink-0">→</span>
            <div className="flex items-center gap-1 min-w-0">
              <MapPin size={12} className="text-accent shrink-0" />
              <span className="truncate text-xs font-medium">
                {dropoffLandmark?.name ?? "Drop-off"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <FareBadge farePerPassenger={ride.farePerPassenger} />
          </div>
        </div>

        {/* Timeline */}
        <TripTimeline status={ride.status} />

        {/* Action Buttons */}
        {ride.status === RideStatus.Accepted && (
          <Button
            className="w-full h-14 text-base font-semibold rounded-2xl bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={() => markPickupMutation.mutate()}
            disabled={markPickupMutation.isPending}
            data-ocid="mark-pickup-btn"
          >
            {markPickupMutation.isPending
              ? "Marking..."
              : "Mark Pickup Complete"}
          </Button>
        )}

        {ride.status === RideStatus.InProgress && (
          <Button
            className="w-full h-14 text-base font-semibold rounded-2xl"
            onClick={() => markDropoffMutation.mutate()}
            disabled={markDropoffMutation.isPending}
            data-ocid="mark-dropoff-btn"
          >
            {markDropoffMutation.isPending
              ? "Completing..."
              : "Mark Dropoff Complete"}
          </Button>
        )}
      </div>

      {/* Fixed SOS Button */}
      <button
        type="button"
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-40 w-14 h-14 rounded-full bg-destructive flex items-center justify-center shadow-[0_4px_16px_oklch(0.55_0.18_20/0.5)] min-h-[44px] min-w-[44px] hover:scale-105 transition-transform active:scale-95"
        aria-label="SOS Emergency"
        data-ocid="sos-btn"
        onClick={() => setSosOpen(true)}
      >
        <AlertTriangle size={22} className="text-destructive-foreground" />
      </button>

      <SOSModal
        open={sosOpen}
        onClose={() => setSosOpen(false)}
        pickupName={pickupLandmark?.name ?? "pickup"}
        dropoffName={dropoffLandmark?.name ?? "dropoff"}
      />

      <PassengerRatingModal
        open={ratingOpen}
        rideId={ride.id}
        passengerId={passengerIdStr}
        passengerName={passengerName}
        passengerPhoto={passengerPhoto}
        onDone={handleRatingDone}
      />
    </MobileLayout>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/driver/active-ride",
  component: DriverActiveRidePage,
});
