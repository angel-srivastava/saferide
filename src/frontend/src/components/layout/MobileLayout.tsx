import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import { Car, List, ShieldCheck, User } from "lucide-react";
import type { ReactNode } from "react";

interface Tab {
  label: string;
  icon: ReactNode;
  to: string;
  ocid: string;
}

const passengerTabs: Tab[] = [
  {
    label: "Book Ride",
    icon: <Car size={22} />,
    to: "/passenger/book",
    ocid: "nav-book",
  },
  {
    label: "Activity",
    icon: <List size={22} />,
    to: "/passenger/history",
    ocid: "nav-activity",
  },
  {
    label: "Safety",
    icon: <ShieldCheck size={22} />,
    to: "/passenger/dashboard",
    ocid: "nav-safety",
  },
  {
    label: "Profile",
    icon: <User size={22} />,
    to: "/passenger/profile",
    ocid: "nav-profile",
  },
];

const driverTabs: Tab[] = [
  {
    label: "Dashboard",
    icon: <Car size={22} />,
    to: "/driver/dashboard",
    ocid: "nav-dashboard",
  },
  {
    label: "Requests",
    icon: <List size={22} />,
    to: "/driver/requests",
    ocid: "nav-requests",
  },
  {
    label: "History",
    icon: <ShieldCheck size={22} />,
    to: "/driver/history",
    ocid: "nav-history",
  },
  {
    label: "Profile",
    icon: <User size={22} />,
    to: "/driver/profile",
    ocid: "nav-profile-driver",
  },
];

interface MobileLayoutProps {
  children: ReactNode;
  userRole?: "passenger" | "driver";
  showNav?: boolean;
}

export function MobileLayout({
  children,
  userRole = "passenger",
  showNav = true,
}: MobileLayoutProps) {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const tabs = userRole === "driver" ? driverTabs : passengerTabs;

  return (
    <div className="flex flex-col min-h-dvh bg-background max-w-md mx-auto relative">
      <main
        className={cn(
          "flex-1 overflow-y-auto",
          showNav && "pb-[calc(4rem+env(safe-area-inset-bottom))]",
        )}
      >
        {children}
      </main>
      {showNav && (
        <nav
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-card border-t border-border/50 safe-area-bottom z-50"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex items-stretch h-16">
            {tabs.map((tab) => {
              const isActive = pathname.startsWith(tab.to);
              return (
                <Link
                  key={tab.to}
                  to={tab.to}
                  data-ocid={tab.ocid}
                  className={cn(
                    "flex flex-col items-center justify-center flex-1 gap-0.5 transition-colors duration-200 min-h-[44px]",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab.icon}
                  <span
                    className={cn(
                      "text-[10px] font-medium leading-none",
                      isActive && "font-semibold",
                    )}
                  >
                    {tab.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
