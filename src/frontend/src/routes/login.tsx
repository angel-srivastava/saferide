import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { createRoute, useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { useEffect } from "react";
import { MobileLayout } from "../components/layout/MobileLayout";
import { useMyProfile } from "../hooks/useMyProfile";
import { useAuthStore } from "../store/authStore";
import { Route as rootRoute } from "./__root";

function LoginPage() {
  const { login, isLoggingIn, identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { user, isLoading } = useAuthStore();
  useMyProfile();

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

  const handleLogin = () => {
    login();
  };

  return (
    <MobileLayout showNav={false}>
      <div className="flex flex-col min-h-dvh">
        {/* Hero section */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-[2rem] bg-primary/20 dark:bg-primary/15 flex items-center justify-center shadow-safety">
                <Shield size={44} className="text-primary" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                ✓
              </div>
            </div>

            <div>
              <h1 className="font-display text-3xl font-semibold text-foreground tracking-tight">
                SafeRide
              </h1>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed max-w-[240px]">
                Safe, affordable shared rides for everyone
              </p>
            </div>
          </div>

          {/* Features grid */}
          <div className="w-full max-w-xs">
            <div className="grid grid-cols-3 gap-2.5 text-center">
              {[
                { icon: "🛡️", label: "Verified\nDrivers" },
                { icon: "💰", label: "Split\nFares" },
                { icon: "📍", label: "Safe\nLandmarks" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-card rounded-2xl p-3 flex flex-col items-center gap-2 shadow-card border border-border/40"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-[10px] text-muted-foreground font-medium leading-tight whitespace-pre-line">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Welcome back text */}
          <div className="text-center space-y-1">
            <h2 className="text-lg font-semibold text-foreground">
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground">
              Sign in to continue your journey
            </p>
          </div>
        </div>

        {/* CTA section */}
        <div
          className="px-6 pb-10 flex flex-col gap-3"
          style={{
            paddingBottom: "calc(2.5rem + env(safe-area-inset-bottom))",
          }}
        >
          <Button
            size="lg"
            className="w-full h-14 text-base font-semibold rounded-2xl shadow-safety transition-smooth"
            onClick={handleLogin}
            disabled={isLoggingIn || isLoading}
            data-ocid="login-btn"
          >
            {isLoggingIn
              ? "Connecting..."
              : isLoading
                ? "Loading..."
                : "Sign In with Internet Identity"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            New to SafeRide?{" "}
            <Link
              to="/signup"
              className="text-primary font-medium hover:underline"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </MobileLayout>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});
