import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createRoute, useNavigate } from "@tanstack/react-router";
import { Check, ChevronLeft, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { GenderPreference, RideType } from "../../backend";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { TopBar } from "../../components/layout/TopBar";
import { FareBadge } from "../../components/shared/FareBadge";
import { LandmarkPicker } from "../../components/shared/LandmarkPicker";
import { useBackend } from "../../hooks/useBackend";
import { useCurrentRideStore } from "../../hooks/useCurrentRide";
import type { FarePreview, LandmarkId } from "../../types";
import { Route as rootRoute } from "../__root";

const STEPS = ["Ride Details", "Pickup & Drop", "Confirm & Book"] as const;
type Step = 0 | 1 | 2;

const GENDER_PREFS: { value: GenderPreference; label: string }[] = [
  { value: GenderPreference.Male, label: "Male" },
  { value: GenderPreference.Female, label: "Female" },
  { value: GenderPreference.NoPreference, label: "No Pref." },
];

interface FareGridProps {
  fareData: FarePreview;
}

function FareGrid({ fareData }: FareGridProps) {
  const fares = [
    { n: 1, fare: fareData.fareFor1 },
    { n: 2, fare: fareData.fareFor2 },
    { n: 3, fare: fareData.fareFor3 },
    { n: 4, fare: fareData.fareFor4 },
  ];
  return (
    <div className="grid grid-cols-4 gap-2 mt-3">
      {fares.map(({ n, fare }) => (
        <div key={n} className="bg-muted/40 rounded-xl p-2.5 text-center">
          <p className="text-xs text-muted-foreground mb-1">{n} pax</p>
          <p className="text-sm font-bold text-foreground">
            ₹{Math.round(fare)}
          </p>
        </div>
      ))}
    </div>
  );
}

interface ProgressBarProps {
  step: Step;
}

function ProgressBar({ step }: ProgressBarProps) {
  return (
    <div className="px-5 py-4 bg-card border-b border-border/50">
      <div className="flex items-center gap-0">
        {STEPS.map((label, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <div key={label} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center gap-1.5 min-w-0">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300",
                    done
                      ? "bg-primary text-primary-foreground"
                      : active
                        ? "bg-primary/20 text-primary border-2 border-primary"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {done ? <Check size={14} /> : i + 1}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium text-center leading-tight truncate w-full px-1",
                    active
                      ? "text-primary"
                      : done
                        ? "text-foreground"
                        : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-1 mt-[-14px] rounded-full transition-all duration-300",
                    done ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Step 1: Ride Details ── */
interface Step1Props {
  rideType: RideType;
  setRideType: (v: RideType) => void;
  genderPref: GenderPreference;
  setGenderPref: (v: GenderPreference) => void;
  passengers: number;
  setPassengers: (v: number) => void;
  onNext: () => void;
}

function Step1RideDetails({
  rideType,
  setRideType,
  genderPref,
  setGenderPref,
  passengers,
  setPassengers,
  onNext,
}: Step1Props) {
  return (
    <div className="px-5 py-5 space-y-6">
      {/* Ride type */}
      <div>
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">
          Ride Type
        </Label>
        <div className="grid grid-cols-2 gap-3 mt-2.5">
          <button
            type="button"
            onClick={() => setRideType(RideType.General)}
            data-ocid="ride-type-general"
            className={cn(
              "py-4 px-3 rounded-2xl border-2 text-left transition-all duration-200",
              rideType === RideType.General
                ? "border-primary bg-primary/10"
                : "border-border/60 bg-card hover:border-primary/40",
            )}
          >
            <span className="text-xl block mb-1.5">🚗</span>
            <p
              className={cn(
                "text-sm font-semibold",
                rideType === RideType.General
                  ? "text-primary"
                  : "text-foreground",
              )}
            >
              General
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">All drivers</p>
          </button>
          <button
            type="button"
            onClick={() => setRideType(RideType.WomenOnly)}
            data-ocid="ride-type-womenonly"
            className={cn(
              "py-4 px-3 rounded-2xl border-2 text-left transition-all duration-200",
              rideType === RideType.WomenOnly
                ? "border-primary bg-primary/10"
                : "border-border/60 bg-card hover:border-primary/40",
            )}
          >
            <span className="text-xl block mb-1.5">👩</span>
            <p
              className={cn(
                "text-sm font-semibold",
                rideType === RideType.WomenOnly
                  ? "text-primary"
                  : "text-foreground",
              )}
            >
              Women Only
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Female drivers only
            </p>
          </button>
        </div>
      </div>

      {/* Gender preference */}
      <div>
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">
          Driver Gender Preference
        </Label>
        <div className="grid grid-cols-3 gap-2 mt-2.5">
          {GENDER_PREFS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setGenderPref(value)}
              data-ocid={`gender-pref-${value.toLowerCase()}`}
              className={cn(
                "py-2.5 rounded-xl border-2 text-sm font-medium transition-all duration-200",
                genderPref === value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/60 text-muted-foreground hover:border-primary/40",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Passengers */}
      <div>
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">
          Passengers
        </Label>
        <div className="flex items-center gap-4 mt-2.5 bg-card rounded-2xl p-4 shadow-card">
          <button
            type="button"
            onClick={() => setPassengers(Math.max(1, passengers - 1))}
            aria-label="Decrease passengers"
            data-ocid="passengers-dec"
            className="w-10 h-10 rounded-full border border-border flex items-center justify-center transition-smooth hover:border-primary hover:text-primary disabled:opacity-40 min-h-[44px] min-w-[44px]"
            disabled={passengers === 1}
          >
            <Minus size={16} />
          </button>
          <div className="flex-1 flex flex-col items-center">
            <span className="text-3xl font-bold font-display text-foreground">
              {passengers}
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">
              {passengers === 1 ? "passenger" : "passengers"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setPassengers(Math.min(4, passengers + 1))}
            aria-label="Increase passengers"
            data-ocid="passengers-inc"
            className="w-10 h-10 rounded-full border border-border flex items-center justify-center transition-smooth hover:border-primary hover:text-primary disabled:opacity-40 min-h-[44px] min-w-[44px]"
            disabled={passengers === 4}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <Button
        className="w-full h-14 text-base font-semibold rounded-2xl mt-2"
        onClick={onNext}
        data-ocid="step1-next"
      >
        Next: Choose Route
      </Button>
    </div>
  );
}

/* ── Step 2: Pickup & Drop ── */
interface Step2Props {
  pickupId: LandmarkId | undefined;
  setPickupId: (id: LandmarkId) => void;
  dropoffId: LandmarkId | undefined;
  setDropoffId: (id: LandmarkId) => void;
  passengers: number;
  fareData: FarePreview | null | undefined;
  fareLoading: boolean;
  onBack: () => void;
  onNext: () => void;
}

function Step2PickupDrop({
  pickupId,
  setPickupId,
  dropoffId,
  setDropoffId,
  passengers,
  fareData,
  fareLoading,
  onBack,
  onNext,
}: Step2Props) {
  const farePerPassenger = fareData
    ? passengers === 1
      ? fareData.fareFor1
      : passengers === 2
        ? fareData.fareFor2
        : passengers === 3
          ? fareData.fareFor3
          : fareData.fareFor4
    : 0;

  return (
    <div className="px-5 py-5 space-y-5">
      {/* Pickup */}
      <div>
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">
          Pickup Location
        </Label>
        <LandmarkPicker
          value={pickupId}
          onChange={(id) => setPickupId(id)}
          placeholder="Select pickup landmark"
          className="mt-2"
          data-ocid="pickup-picker"
        />
      </div>

      {/* Dropoff */}
      <div>
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">
          Drop-off Location
        </Label>
        <LandmarkPicker
          value={dropoffId}
          onChange={(id) => setDropoffId(id)}
          placeholder="Select drop-off landmark"
          className="mt-2"
          data-ocid="dropoff-picker"
        />
      </div>

      {/* Fare preview */}
      {(fareData || fareLoading) && pickupId && dropoffId && (
        <div
          className="bg-card rounded-2xl p-4 shadow-card"
          data-ocid="fare-preview-card"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
            Fare Preview
          </p>
          {fareLoading ? (
            <div className="space-y-2">
              <div className="h-9 bg-muted/40 rounded-xl animate-pulse" />
              <div className="h-16 bg-muted/40 rounded-xl animate-pulse" />
            </div>
          ) : fareData ? (
            <>
              <div className="flex items-end justify-between">
                <FareBadge
                  farePerPassenger={farePerPassenger}
                  totalFare={fareData.totalFare}
                  passengers={passengers}
                  large
                  data-ocid="fare-badge"
                />
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    {fareData.distanceKm.toFixed(1)} km
                  </p>
                  <p className="text-xs text-muted-foreground">distance</p>
                </div>
              </div>
              <FareGrid fareData={fareData} />
            </>
          ) : null}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          className="h-14 rounded-2xl px-5"
          onClick={onBack}
          data-ocid="step2-back"
        >
          <ChevronLeft size={18} />
        </Button>
        <Button
          className="flex-1 h-14 text-base font-semibold rounded-2xl"
          disabled={!pickupId || !dropoffId}
          onClick={onNext}
          data-ocid="step2-next"
        >
          Next: Review
        </Button>
      </div>
    </div>
  );
}

/* ── Step 3: Confirm & Book ── */
interface Step3Props {
  rideType: RideType;
  genderPref: GenderPreference;
  passengers: number;
  pickupName: string;
  dropoffName: string;
  fareData: FarePreview | null | undefined;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function Step3Confirm({
  rideType,
  genderPref,
  passengers,
  pickupName,
  dropoffName,
  fareData,
}: Step3Props) {
  const farePerPassenger = fareData
    ? passengers === 1
      ? fareData.fareFor1
      : passengers === 2
        ? fareData.fareFor2
        : passengers === 3
          ? fareData.fareFor3
          : fareData.fareFor4
    : 0;

  const genderLabel =
    genderPref === GenderPreference.Male
      ? "Male"
      : genderPref === GenderPreference.Female
        ? "Female"
        : "No Preference";

  return (
    <div className="px-5 py-5 space-y-5 pb-32">
      {/* Summary card */}
      <div className="bg-card rounded-2xl p-4 shadow-card">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
          Trip Summary
        </p>
        <SummaryRow label="Pickup" value={pickupName} />
        <SummaryRow label="Drop-off" value={dropoffName} />
        <SummaryRow
          label="Ride Type"
          value={
            rideType === RideType.WomenOnly ? "👩 Women Only" : "🚗 General"
          }
        />
        <SummaryRow label="Gender Pref." value={genderLabel} />
        <SummaryRow label="Passengers" value={passengers.toString()} />
        {fareData && (
          <div className="pt-3 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Fare per person
            </span>
            <FareBadge farePerPassenger={farePerPassenger} large />
          </div>
        )}
      </div>

      {/* Fare breakdown */}
      {fareData && (
        <div className="bg-card rounded-2xl p-4 shadow-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
            Shared Fare Breakdown
          </p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { n: 1, fare: fareData.fareFor1 },
              { n: 2, fare: fareData.fareFor2 },
              { n: 3, fare: fareData.fareFor3 },
              { n: 4, fare: fareData.fareFor4 },
            ].map(({ n, fare }) => (
              <div
                key={n}
                className={cn(
                  "rounded-xl p-2.5 text-center border",
                  n === passengers
                    ? "bg-primary/10 border-primary/40"
                    : "bg-muted/40 border-transparent",
                )}
              >
                <p className="text-xs text-muted-foreground mb-1">{n} pax</p>
                <p className="text-sm font-bold text-foreground">
                  ₹{Math.round(fare)}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            Fare splits automatically as more passengers join. Distance:{" "}
            {fareData.distanceKm.toFixed(1)} km
          </p>
        </div>
      )}

      {/* Safety notice */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-1.5">
        <p className="text-xs font-semibold text-primary">
          🔒 Driver details shown after booking
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Once your ride is confirmed, you'll see the driver's name, photo,
          vehicle number, and rating on the active ride screen.
        </p>
      </div>
    </div>
  );
}

/* ── Main Page ── */
function BookRidePage() {
  const navigate = useNavigate();
  const { actor } = useBackend();
  const { setActiveRideId } = useCurrentRideStore();
  const { data: landmarks = [] } = useQuery({
    queryKey: ["landmarks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLandmarks();
    },
    enabled: !!actor,
    staleTime: 10 * 60 * 1000,
  });

  const [step, setStep] = useState<Step>(0);
  const [rideType, setRideType] = useState<RideType>(RideType.General);
  const [genderPref, setGenderPref] = useState<GenderPreference>(
    GenderPreference.NoPreference,
  );
  const [passengers, setPassengers] = useState(1);
  const [pickupId, setPickupId] = useState<LandmarkId | undefined>();
  const [dropoffId, setDropoffId] = useState<LandmarkId | undefined>();

  const fareQuery = useQuery({
    queryKey: ["fare", pickupId?.toString(), dropoffId?.toString()],
    queryFn: async () => {
      if (!actor || !pickupId || !dropoffId) return null;
      return actor.previewFare(pickupId, dropoffId);
    },
    enabled: !!actor && !!pickupId && !!dropoffId,
  });

  const createRideMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !pickupId || !dropoffId)
        throw new Error("Missing ride info");
      return actor.createRide({
        pickupLandmarkId: pickupId,
        dropoffLandmarkId: dropoffId,
        rideType,
        genderPreference: genderPref,
        totalPassengers: BigInt(passengers),
      });
    },
    onSuccess: (ride) => {
      setActiveRideId(ride.id);
      toast.success("Ride requested! Finding you a driver...", {
        duration: 5000,
      });
      navigate({ to: "/passenger/active-ride" });
    },
    onError: () => toast.error("Failed to book ride. Please try again."),
  });

  const getLandmarkName = (id?: bigint) =>
    id ? (landmarks.find((l) => l.id === id)?.name ?? "Unknown") : "";

  const stepTitle = ["Ride Details", "Pickup & Drop", "Confirm & Book"][step];

  return (
    <MobileLayout userRole="passenger" showNav={false}>
      <TopBar
        title={stepTitle}
        showBack={step === 0}
        action={
          step > 0 ? (
            <button
              type="button"
              className="flex items-center gap-1 text-sm text-primary font-medium min-h-[44px] px-1"
              onClick={() => setStep((s) => (s - 1) as Step)}
              data-ocid="wizard-back"
              aria-label="Go back"
            >
              <ChevronLeft size={20} />
            </button>
          ) : undefined
        }
      />
      <ProgressBar step={step} />

      {step === 0 && (
        <Step1RideDetails
          rideType={rideType}
          setRideType={setRideType}
          genderPref={genderPref}
          setGenderPref={setGenderPref}
          passengers={passengers}
          setPassengers={setPassengers}
          onNext={() => setStep(1)}
        />
      )}

      {step === 1 && (
        <Step2PickupDrop
          pickupId={pickupId}
          setPickupId={setPickupId}
          dropoffId={dropoffId}
          setDropoffId={setDropoffId}
          passengers={passengers}
          fareData={fareQuery.data}
          fareLoading={fareQuery.isFetching}
          onBack={() => setStep(0)}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <>
          <Step3Confirm
            rideType={rideType}
            genderPref={genderPref}
            passengers={passengers}
            pickupName={getLandmarkName(pickupId)}
            dropoffName={getLandmarkName(dropoffId)}
            fareData={fareQuery.data}
          />
          {/* Sticky confirm button */}
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-5 pb-6 pt-3 bg-background/95 backdrop-blur border-t border-border/50 z-40">
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="h-14 rounded-2xl px-5"
                onClick={() => setStep(1)}
                data-ocid="step3-back"
              >
                <ChevronLeft size={18} />
              </Button>
              <Button
                className="flex-1 h-14 text-base font-semibold rounded-2xl"
                disabled={createRideMutation.isPending}
                onClick={() => createRideMutation.mutate()}
                data-ocid="confirm-book-ride"
              >
                {createRideMutation.isPending ? "Booking..." : "Confirm & Book"}
              </Button>
            </div>
            {fareQuery.data && (
              <p className="text-center text-xs text-muted-foreground mt-2">
                Fare includes safety fee · 100% Secure
              </p>
            )}
          </div>
        </>
      )}
    </MobileLayout>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/passenger/book",
  component: BookRidePage,
});
