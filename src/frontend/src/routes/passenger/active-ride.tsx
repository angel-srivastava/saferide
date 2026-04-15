import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRoute, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock,
  MapPin,
  Phone,
  Share2,
  Shield,
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
}: {
  pickup: Landmark | undefined;
  dropoff: Landmark | undefined;
}) {
  // Normalise lat/lng to a 0-100 coordinate box
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

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-card border border-border/30 h-44">
      <svg
        viewBox="0 0 100 90"
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      >
        {/* Grid lines */}
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

        {/* Route dashes */}
        <line
          x1={pCoord.x}
          y1={pCoord.y}
          x2={dCoord.x}
          y2={dCoord.y}
          stroke="oklch(0.72 0.14 195)"
          strokeWidth="1.2"
          strokeDasharray="3,2"
          strokeLinecap="round"
        />

        {/* Pickup pin — teal */}
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

        {/* Dropoff pin — amber */}
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

      {/* Legend labels */}
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

      {/* Map label */}
      <div className="absolute top-2 right-3 text-[9px] text-foreground/30 font-mono uppercase tracking-wider">
        SafeRide Map
      </div>
    </div>
  );
}

// ── Trip Timeline ───────────────────────────────────────────────────────────

const TIMELINE_STEPS = [
  { key: RideStatus.Requested, label: "Waiting for driver" },
  { key: RideStatus.Accepted, label: "Driver en route to pickup" },
  { key: RideStatus.InProgress, label: "Ride in progress" },
  { key: RideStatus.Completed, label: "Completed" },
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
  driverName,
}: {
  open: boolean;
  onClose: () => void;
  pickupName: string;
  dropoffName: string;
  driverName: string;
}) {
  if (!open) return null;

  function handleShareEmergency() {
    const msg = `🚨 EMERGENCY: I'm on a SafeRide trip from ${pickupName} to ${dropoffName} with driver ${driverName}. Please check on me immediately.`;
    navigator.clipboard.writeText(msg).then(() => {
      toast.success("Emergency info copied to clipboard");
    });
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
        aria-label="Close SOS modal"
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
        <p className="text-sm text-muted-foreground">
          Tap an option below. Help is available 24/7.
        </p>

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

// ── Rating Modal ─────────────────────────────────────────────────────────────

function RatingModal({
  open,
  rideId,
  driverId,
  driverName,
  vehicleNumber,
  driverPhoto,
  onDone,
  onSkip,
}: {
  open: boolean;
  rideId: bigint;
  driverId: string;
  driverName: string;
  vehicleNumber: string;
  driverPhoto: string;
  onDone: () => void;
  onSkip: () => void;
}) {
  const { actor } = useBackend();
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      // driverId is a Principal string — parse it
      const { Principal } = await import("@icp-sdk/core/principal");
      await actor.submitRating({
        rideId,
        toUserId: Principal.fromText(driverId),
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
      data-ocid="rating-modal"
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md bg-card border border-border/50 rounded-t-3xl p-6 space-y-5 shadow-[0_-8px_32px_oklch(0_0_0/0.25)]">
        <div className="text-center">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Trip Completed
          </p>
          <h2 className="text-xl font-bold">Rate Your Experience</h2>
        </div>

        <div className="flex flex-col items-center gap-2">
          <UserAvatar name={driverName} photoUrl={driverPhoto} size="xl" />
          <p className="font-semibold text-base">{driverName}</p>
          <p className="text-xs text-muted-foreground font-mono">
            {vehicleNumber}
          </p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Tap to rate your driver
          </p>
          <RatingStars
            rating={stars}
            interactive
            onChange={setStars}
            size="lg"
            data-ocid="rating-stars"
          />
        </div>

        <Textarea
          placeholder="Share your experience (optional)"
          maxLength={200}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="resize-none h-20 text-sm"
          data-ocid="rating-comment"
        />
        <p className="text-xs text-muted-foreground text-right -mt-3">
          {comment.length}/200
        </p>

        <Button
          className="w-full h-12 rounded-2xl font-semibold"
          onClick={() => mutation.mutate()}
          disabled={stars === 0 || mutation.isPending}
          data-ocid="submit-rating-btn"
        >
          {mutation.isPending ? "Submitting..." : "Submit Rating"}
        </Button>

        <button
          type="button"
          onClick={onSkip}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
          data-ocid="skip-rating-btn"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

function ActiveRidePage() {
  const navigate = useNavigate();
  const { actor } = useBackend();
  const qc = useQueryClient();
  const { data: ride, activeRideId } = useCurrentRide();
  const { setActiveRideId } = useCurrentRideStore();
  const { data: landmarks = [] } = useLandmarks();

  const [sosOpen, setSosOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);

  const isCompleted = ride?.status === RideStatus.Completed;

  const pickupLandmark = landmarks.find(
    (l) => ride && l.id === ride.pickupLandmarkId,
  );
  const dropoffLandmark = landmarks.find(
    (l) => ride && l.id === ride.dropoffLandmarkId,
  );

  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !activeRideId) throw new Error("No active ride");
      return actor.cancelRide(activeRideId);
    },
    onSuccess: () => {
      setActiveRideId(null);
      qc.invalidateQueries({ queryKey: ["myRideHistory"] });
      toast.info("Ride cancelled.");
      navigate({ to: "/passenger/book" });
    },
    onError: () => toast.error("Failed to cancel ride."),
  });

  function handleShare() {
    const msg = `I'm on a SafeRide trip from ${pickupLandmark?.name ?? "pickup"} to ${dropoffLandmark?.name ?? "dropoff"} with my verified driver. Track my trip via SafeRide.`;
    navigator.clipboard
      .writeText(msg)
      .then(() => toast.success("Trip info copied to clipboard"));
  }

  function handleRatingDone() {
    setRatingOpen(false);
    setActiveRideId(null);
    qc.invalidateQueries({ queryKey: ["myRideHistory"] });
    navigate({ to: "/passenger/dashboard" });
  }

  if (!activeRideId || !ride) {
    return (
      <MobileLayout userRole="passenger">
        <TopBar title="Active Ride" showBack />
        <EmptyState
          icon={<Phone size={28} />}
          title="No active ride"
          description="Book a ride to get started"
          action={
            <Button
              onClick={() => navigate({ to: "/passenger/book" })}
              data-ocid="book-ride-cta"
            >
              Book a Ride
            </Button>
          }
          data-ocid="empty-active-ride"
        />
      </MobileLayout>
    );
  }

  const driverName =
    (ride as { driverName?: string }).driverName ?? "Your Driver";
  const driverPhoto = (ride as { driverPhoto?: string }).driverPhoto ?? "";
  const vehicleNumber =
    (ride as { vehicleNumber?: string }).vehicleNumber ?? "—";
  const driverIdStr = ride.driverId?.toText() ?? "";

  return (
    <MobileLayout userRole="passenger">
      <TopBar title="Active Ride" />

      <div className="px-4 pt-4 pb-6 space-y-3">
        {/* Static Map */}
        <StaticRideMap pickup={pickupLandmark} dropoff={dropoffLandmark} />

        {/* Ride Info Card */}
        <div className="bg-card rounded-2xl p-4 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserAvatar name={driverName} photoUrl={driverPhoto} size="md" />
              <div>
                <p className="font-semibold text-sm leading-tight">
                  {driverName}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {vehicleNumber}
                </p>
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

          <FareBadge
            farePerPassenger={ride.farePerPassenger}
            passengers={Number(ride.totalPassengers)}
          />
        </div>

        {/* Timeline */}
        <TripTimeline status={ride.status} />

        {/* Share button */}
        {!isCompleted && (
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center justify-center gap-2 w-full bg-muted/60 border border-border/50 rounded-2xl px-4 py-3 text-sm font-medium hover:bg-muted transition-colors"
            data-ocid="share-ride-btn"
          >
            <Share2 size={15} />
            Share Ride with Contacts
          </button>
        )}

        {/* Cancel Button */}
        {[RideStatus.Requested, RideStatus.Accepted].includes(ride.status) && (
          <Button
            variant="destructive"
            className="w-full h-12 rounded-2xl"
            onClick={() => cancelMutation.mutate()}
            disabled={cancelMutation.isPending}
            data-ocid="cancel-ride-btn"
          >
            {cancelMutation.isPending ? "Cancelling..." : "Cancel Ride"}
          </Button>
        )}

        {/* Completed CTA */}
        {isCompleted && !ratingOpen && (
          <Button
            className="w-full h-12 rounded-2xl"
            onClick={() => setRatingOpen(true)}
            data-ocid="rate-driver-btn"
          >
            Rate Your Driver
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

      {/* SOS Modal */}
      <SOSModal
        open={sosOpen}
        onClose={() => setSosOpen(false)}
        pickupName={pickupLandmark?.name ?? "pickup"}
        dropoffName={dropoffLandmark?.name ?? "dropoff"}
        driverName={driverName}
      />

      {/* Rating Modal — auto-shows when completed, also triggerable via button */}
      <RatingModal
        open={ratingOpen || isCompleted}
        rideId={ride.id}
        driverId={driverIdStr}
        driverName={driverName}
        vehicleNumber={vehicleNumber}
        driverPhoto={driverPhoto}
        onDone={handleRatingDone}
        onSkip={handleRatingDone}
      />
    </MobileLayout>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/passenger/active-ride",
  component: ActiveRidePage,
});
