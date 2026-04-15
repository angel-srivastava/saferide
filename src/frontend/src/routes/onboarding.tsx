import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { createRoute, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Camera,
  ChevronLeft,
  FileText,
  Shield,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { type Gender, Role } from "../backend";
import { MobileLayout } from "../components/layout/MobileLayout";
import { UserAvatar } from "../components/shared/UserAvatar";
import { useBackend } from "../hooks/useBackend";
import { useAuthStore } from "../store/authStore";
import type { RegisterUserRequest } from "../types";
import { Route as rootRoute } from "./__root";

const ROLE_STORAGE_KEY = "saferide_signup_role";

type GenderOption = "Female" | "Male" | "Other";

interface Step1Data {
  name: string;
  phone: string;
  gender: GenderOption;
}

interface Step2Data {
  photoUrl: string;
}

interface Step3Data {
  vehicleNumber: string;
  licenseId: string;
}

function ProgressDots({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={`progress-dot-${i}-of-${total}`}
          className={cn(
            "h-1.5 rounded-full transition-all duration-300",
            i < current
              ? "bg-primary w-6"
              : i === current
                ? "bg-primary w-10"
                : "bg-border w-6",
          )}
        />
      ))}
    </div>
  );
}

function OnboardingPage() {
  const navigate = useNavigate();
  const { actor } = useBackend();
  const setUser = useAuthStore((s) => s.setUser);
  const [step, setStep] = useState(0);

  // Read saved role from localStorage
  const savedRole = localStorage.getItem(ROLE_STORAGE_KEY);
  const [role, setRole] = useState<Role>(
    savedRole === "driver" ? Role.Driver : Role.Passenger,
  );

  const isDriver = role === Role.Driver;
  const effectiveSteps = isDriver ? 3 : 2;

  // Step data
  const [step1, setStep1] = useState<Step1Data>({
    name: "",
    phone: "",
    gender: "Female",
  });
  const [step2, setStep2] = useState<Step2Data>({ photoUrl: "" });
  const [step3, setStep3] = useState<Step3Data>({
    vehicleNumber: "",
    licenseId: "",
  });

  // Re-check saved role on mount
  useEffect(() => {
    const r = localStorage.getItem(ROLE_STORAGE_KEY);
    if (r === "driver") setRole(Role.Driver);
    else setRole(Role.Passenger);
  }, []);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      const req: RegisterUserRequest = {
        name: step1.name,
        phone: step1.phone,
        role,
        gender: step1.gender as Gender,
        photoUrl: step2.photoUrl,
      };
      const user = await actor.registerUser(req);
      if (role === Role.Driver) {
        await actor.registerDriverProfile({
          vehicleNumber: step3.vehicleNumber,
          licenseId: step3.licenseId,
        });
      }
      return user;
    },
    onSuccess: (user) => {
      setUser(user);
      toast.success("Welcome to SafeRide! 🎉");
      localStorage.removeItem(ROLE_STORAGE_KEY);
      if (user.role === Role.Driver) {
        navigate({ to: "/driver/dashboard" });
      } else {
        navigate({ to: "/passenger/book" });
      }
    },
    onError: () => toast.error("Something went wrong. Please try again."),
  });

  const handleNext = () => {
    if (step === 0) {
      if (!step1.name.trim()) return toast.error("Please enter your name");
      if (!step1.phone.trim())
        return toast.error("Please enter your phone number");
    }
    if (step < effectiveSteps - 1) {
      setStep((s) => s + 1);
    } else {
      mutation.mutate();
    }
  };

  const stepTitles = ["Your Details", "Profile Photo", "Vehicle Info"];
  const stepIcons = [Shield, Camera, FileText];
  const StepIcon = stepIcons[step];

  return (
    <MobileLayout showNav={false}>
      {/* Top bar with back + progress */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border/40">
        <div className="flex items-center h-14 px-4 gap-3">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-muted transition-colors min-h-[44px] min-w-[44px] -ml-1"
              aria-label="Go back"
              data-ocid="onboarding-back"
            >
              <ChevronLeft size={22} />
            </button>
          ) : (
            <div className="w-9" />
          )}
          <div className="flex-1 flex flex-col items-center gap-1">
            <p className="text-xs text-muted-foreground font-medium">
              Step {step + 1} of {effectiveSteps}
            </p>
            <ProgressDots current={step} total={effectiveSteps} />
          </div>
          <div className="w-9" />
        </div>
      </header>

      <div className="px-5 py-6 flex flex-col gap-6">
        {/* Step header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <StepIcon size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">
              {stepTitles[step]}
            </h2>
            <p className="text-xs text-muted-foreground">
              {step === 0 && "Tell us a bit about yourself"}
              {step === 1 && "Add a photo so others can recognize you"}
              {step === 2 && "Vehicle info for verification"}
            </p>
          </div>
        </div>

        {/* Step 0: Your Details */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name
              </Label>
              <Input
                id="name"
                placeholder="Priya Sharma"
                className="mt-1.5 h-12 rounded-xl"
                value={step1.name}
                onChange={(e) =>
                  setStep1((d) => ({ ...d, name: e.target.value }))
                }
                data-ocid="input-name"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </Label>
              <Input
                id="phone"
                placeholder="+91 98765 43210"
                className="mt-1.5 h-12 rounded-xl"
                value={step1.phone}
                onChange={(e) =>
                  setStep1((d) => ({ ...d, phone: e.target.value }))
                }
                data-ocid="input-phone"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Gender</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {(["Female", "Male", "Other"] as GenderOption[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setStep1((d) => ({ ...d, gender: g }))}
                    data-ocid={`gender-${g.toLowerCase()}`}
                    className={cn(
                      "py-3 rounded-xl border-2 text-sm font-medium transition-all",
                      step1.gender === g
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40",
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">I want to</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {([Role.Passenger, Role.Driver] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    data-ocid={`role-${r.toLowerCase()}`}
                    className={cn(
                      "py-3 rounded-xl border-2 text-sm font-medium transition-all",
                      role === r
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40",
                    )}
                  >
                    {r === Role.Passenger ? "🚗 Book Rides" : "🚙 Drive & Earn"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Profile Photo */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="flex flex-col items-center gap-4">
              <UserAvatar
                name={step1.name || "?"}
                photoUrl={step2.photoUrl || undefined}
                size="xl"
              />
              <p className="text-xs text-muted-foreground">Photo preview</p>
            </div>

            <div>
              <Label htmlFor="photo-url" className="text-sm font-medium">
                Profile Photo URL
              </Label>
              <Input
                id="photo-url"
                placeholder="https://example.com/photo.jpg"
                className="mt-1.5 h-12 rounded-xl"
                value={step2.photoUrl}
                onChange={(e) => setStep2({ photoUrl: e.target.value })}
                data-ocid="input-photo-url"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Paste a link to your profile photo (optional)
              </p>
            </div>

            <div className="bg-muted/40 rounded-xl p-3 flex items-start gap-2.5">
              <AlertCircle
                size={16}
                className="text-muted-foreground mt-0.5 shrink-0"
              />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your photo helps passengers and drivers recognize each other.
                You can skip this and add a photo later.
              </p>
            </div>
          </div>
        )}

        {/* Step 2 (drivers only): Vehicle Info */}
        {step === 2 && isDriver && (
          <div className="space-y-4">
            <div className="p-3.5 bg-primary/10 dark:bg-primary/15 rounded-xl flex items-start gap-2.5">
              <Shield size={16} className="text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-primary font-medium leading-relaxed">
                Documents will be reviewed within 24 hours. You can start
                driving after approval.
              </p>
            </div>

            <div>
              <Label htmlFor="vehicle" className="text-sm font-medium">
                Vehicle Number
              </Label>
              <Input
                id="vehicle"
                placeholder="MH 01 AB 1234"
                className="mt-1.5 h-12 rounded-xl font-mono"
                value={step3.vehicleNumber}
                onChange={(e) =>
                  setStep3((d) => ({ ...d, vehicleNumber: e.target.value }))
                }
                data-ocid="input-vehicle"
              />
            </div>

            <div>
              <Label htmlFor="license" className="text-sm font-medium">
                License ID
              </Label>
              <Input
                id="license"
                placeholder="DL-1234567890"
                className="mt-1.5 h-12 rounded-xl font-mono"
                value={step3.licenseId}
                onChange={(e) =>
                  setStep3((d) => ({ ...d, licenseId: e.target.value }))
                }
                data-ocid="input-license"
              />
            </div>

            <div className="bg-muted/30 rounded-xl p-3.5 space-y-2">
              <p className="text-xs font-semibold text-foreground">
                Documents checklist
              </p>
              {[
                "Valid driving license",
                "Vehicle registration certificate",
                "Insurance papers",
              ].map((doc) => (
                <div key={doc} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-border" />
                  <span className="text-xs text-muted-foreground">{doc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            size="lg"
            className="flex-1 h-14 text-base font-semibold rounded-2xl shadow-safety transition-smooth"
            onClick={handleNext}
            disabled={mutation.isPending}
            data-ocid="onboarding-next"
          >
            {mutation.isPending
              ? "Creating profile..."
              : step === effectiveSteps - 1
                ? "Create My Profile"
                : "Next"}
          </Button>
        </div>

        {/* Skip photo step */}
        {step === 1 && (
          <button
            type="button"
            className="text-xs text-muted-foreground text-center hover:text-foreground transition-colors"
            onClick={handleNext}
            data-ocid="skip-photo"
          >
            Skip for now
          </button>
        )}
      </div>
    </MobileLayout>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding",
  component: OnboardingPage,
});
