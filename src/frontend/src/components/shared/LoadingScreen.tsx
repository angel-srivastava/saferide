import { Shield } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background gap-4 z-50">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
            <Shield size={32} className="text-primary" />
          </div>
          <div className="absolute inset-0 rounded-2xl border-2 border-primary/30 animate-ping" />
        </div>
        <div className="text-center">
          <h2 className="font-display text-xl font-semibold text-foreground">
            SafeRide
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Loading your safe journey...
          </p>
        </div>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
