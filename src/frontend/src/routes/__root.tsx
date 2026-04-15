import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Outlet, createRootRoute, redirect } from "@tanstack/react-router";
import { Role } from "../backend";
import { LoadingScreen } from "../components/shared/LoadingScreen";
import { useMyProfile } from "../hooks/useMyProfile";
import { useAuthStore } from "../store/authStore";

function RootComponent() {
  const { identity, isInitializing } = useInternetIdentity();
  const { isLoading } = useAuthStore();
  useMyProfile(); // syncs to authStore

  if (isInitializing || (!!identity && isLoading)) {
    return <LoadingScreen />;
  }

  return <Outlet />;
}

export const Route = createRootRoute({
  component: RootComponent,
  beforeLoad: () => {
    // Routing guards are handled per-route
  },
});
