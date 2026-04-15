import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  maxStars?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = { sm: 12, md: 16, lg: 22 };

export function RatingStars({
  rating,
  maxStars = 5,
  interactive = false,
  onChange,
  size = "md",
  className,
}: RatingStarsProps) {
  const px = sizeMap[size];

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      role={interactive ? "radiogroup" : undefined}
      aria-label={`Rating: ${rating} out of ${maxStars}`}
    >
      {Array.from({ length: maxStars }, (_, i) => i).map((i) => {
        const filled = rating >= i + 1;
        const half = !filled && rating >= i + 0.5;
        return (
          <button
            key={`star-${i}`}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(i + 1)}
            className={cn(
              "relative",
              interactive &&
                "cursor-pointer hover:scale-110 transition-transform",
            )}
            aria-label={`${i + 1} star`}
          >
            <Star
              size={px}
              className={cn(
                "transition-colors",
                filled
                  ? "text-accent fill-accent"
                  : "text-muted-foreground fill-none",
              )}
            />
            {half && (
              <Star
                size={px}
                className="absolute inset-0 text-accent fill-accent"
                style={{ clipPath: "inset(0 50% 0 0)" }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
