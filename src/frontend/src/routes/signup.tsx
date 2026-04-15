import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { createRoute, useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Car, Check, Shield, User } from "lucide-react";
import { useEffect, useState } from "react";
import { MobileLayout } from "../components/layout/MobileLayout";
import { useMyProfile } from "../hooks/useMyProfile";
import { useAuthStore } from "../store/authStore";
import { Route as rootRoute } from "./__root";

type SelectedRole = "passenger" | "driver";

const ROLE_STORAGE_KEY = "saferide_signup_role";

function SignupPage() {
  const { login, isLoggingIn, identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { user, isLoading } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<SelectedRole>("passenger");
  useMyProfile();

  // Persist selected role for onboarding to read
  const handleRoleSelect = (role: SelectedRole) => {
    setSelectedRole(role);
    localStorage.setItem(ROLE_STORAGE_KEY, role);
  };

  useEffect(() => {
    if (!isLoading && identity && user !== undefined) {
      if (user) {
        const dest =
          user.role === "Driver" ? "/driver/dashboard" : "/passenger/book";
        navigate({ to: dest });
      } else if (user === null && identity) {
        navigate({ to: "/onboarding" });
      }
    }
  }, [user, isLoading, identity, navigate]);

  const handleSignup = () => {
    localStorage.setItem(ROLE_STORAGE_KEY, selectedRole);
    login();
  };

  const roles = [
    {
      id: "passenger" as SelectedRole,
      icon: User,
      title: "I'm a Passenger",
      description: "Book safe, affordable shared rides",
      emoji: "🚗",
    },
    {
      id: "driver" as SelectedRole,
      icon: Car,
      title: "I'm a Driver",
      description: "Drive & earn on your own schedule",
      emoji: "🚙",
    },
  ];

  return (
    <MobileLayout showNav={false}>
      <div className="flex flex-col min-h-dvh">
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-7">
          {/* Header */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-20 h-20 rounded-[2rem] bg-primary/20 dark:bg-primary/15 flex items-center justify-center shadow-safety">
              <Shield size={40} className="text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold text-foreground">
                Join SafeRide
              </h1>
              <p className="text-muted-foreground mt-1.5 text-sm max-w-[260px] leading-relaxed">
                Safe, affordable rides for everyone
              </p>
            </div>
          </div>

          {/* Role selection */}
          <div className="w-full max-w-xs space-y-3">
            <p className="text-xs font-medium text-muted-foreground text-center uppercase tracking-wider">
              How will you use SafeRide?
            </p>
            <div className="flex flex-col gap-3">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleSelect(role.id)}
                    data-ocid={`role-card-${role.id}`}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                      isSelected
                        ? "border-primary bg-primary/10 dark:bg-primary/15"
                        : "border-border bg-card hover:border-primary/40 hover:bg-muted/40"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-semibold text-sm ${isSelected ? "text-primary" : "text-foreground"}`}
                      >
                        {role.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                        {role.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <Check size={14} className="text-primary-foreground" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA section */}
        <div
          className="px-6 flex flex-col gap-3"
          style={{
            paddingBottom: "calc(2.5rem + env(safe-area-inset-bottom))",
          }}
        >
          <Button
            size="lg"
            className="w-full h-14 text-base font-semibold rounded-2xl shadow-safety transition-smooth"
            onClick={handleSignup}
            disabled={isLoggingIn || isLoading}
            data-ocid="signup-btn"
          >
            {isLoggingIn
              ? "Connecting..."
              : `Sign up as ${selectedRole === "passenger" ? "Passenger" : "Driver"}`}
          </Button>
          <p className="text-center text-xs text-muted-foreground pb-2">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </MobileLayout>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signup",
  component: SignupPage,
});
