import { cn } from "@/lib/utils";
import { useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

interface TopBarProps {
  title: string;
  showBack?: boolean;
  action?: ReactNode;
  className?: string;
  transparent?: boolean;
}

export function TopBar({
  title,
  showBack = false,
  action,
  className,
  transparent = false,
}: TopBarProps) {
  const router = useRouter();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex items-center h-14 px-4 gap-3",
        transparent
          ? "bg-transparent"
          : "bg-card/95 backdrop-blur-sm border-b border-border/40",
        className,
      )}
    >
      {showBack && (
        <button
          type="button"
          onClick={() => router.history.back()}
          className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-muted transition-colors -ml-1 min-h-[44px] min-w-[44px]"
          aria-label="Go back"
          data-ocid="topbar-back"
        >
          <ChevronLeft size={22} className="text-foreground" />
        </button>
      )}
      <h1
        className={cn(
          "flex-1 text-base font-semibold font-display truncate",
          showBack && "text-center",
        )}
      >
        {title}
      </h1>
      {action && <div className="flex items-center">{action}</div>}
      {!action && showBack && <div className="w-9" />}
    </header>
  );
}
