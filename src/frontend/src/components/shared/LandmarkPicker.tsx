import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  Building2,
  ChevronDown,
  Landmark,
  MapPin,
  Navigation,
  Search,
  Train,
} from "lucide-react";
import { useMemo, useState } from "react";
import { LandmarkType as LandmarkTypeEnum } from "../../backend";
import { useLandmarks } from "../../hooks/useLandmarks";
import type { LandmarkId, Landmark as LandmarkType } from "../../types";

interface LandmarkPickerProps {
  value?: LandmarkId;
  onChange: (id: LandmarkId, landmark: LandmarkType) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  "data-ocid"?: string;
}

const typeIcons: Record<LandmarkTypeEnum, React.ReactNode> = {
  [LandmarkTypeEnum.Metro]: <Train size={14} />,
  [LandmarkTypeEnum.Station]: <Navigation size={14} />,
  [LandmarkTypeEnum.Chowk]: <MapPin size={14} />,
  [LandmarkTypeEnum.Hospital]: <Building2 size={14} />,
  [LandmarkTypeEnum.Landmark]: <Landmark size={14} />,
};

const typeLabels: Record<LandmarkTypeEnum, string> = {
  [LandmarkTypeEnum.Metro]: "Metro",
  [LandmarkTypeEnum.Station]: "Station",
  [LandmarkTypeEnum.Chowk]: "Chowk",
  [LandmarkTypeEnum.Hospital]: "Hospital",
  [LandmarkTypeEnum.Landmark]: "Landmark",
};

export function LandmarkPicker({
  value,
  onChange,
  placeholder = "Select a landmark",
  disabled,
  className,
  "data-ocid": ocid,
}: LandmarkPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: landmarks = [] } = useLandmarks();

  const selected = useMemo(
    () => landmarks.find((l) => l.id === value),
    [landmarks, value],
  );

  const grouped = useMemo(() => {
    const filtered = landmarks.filter(
      (l) =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.city.toLowerCase().includes(search.toLowerCase()),
    );
    return filtered.reduce<Record<string, LandmarkType[]>>((acc, l) => {
      const key = l.city;
      if (!acc[key]) acc[key] = [];
      acc[key].push(l);
      return acc;
    }, {});
  }, [landmarks, search]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          data-ocid={ocid}
          className={cn(
            "flex items-center w-full gap-3 px-4 py-3 rounded-xl bg-card border border-border/50 text-left transition-colors hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring min-h-[52px]",
            disabled && "opacity-50 cursor-not-allowed",
            className,
          )}
        >
          <MapPin size={18} className="text-primary shrink-0" />
          <span
            className={cn(
              "flex-1 text-sm truncate",
              !selected && "text-muted-foreground",
            )}
          >
            {selected ? selected.name : placeholder}
          </span>
          <ChevronDown size={16} className="text-muted-foreground shrink-0" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="max-h-[80dvh] flex flex-col rounded-t-2xl"
      >
        <SheetHeader className="px-0">
          <SheetTitle className="font-display text-lg">
            Pick a Landmark
          </SheetTitle>
        </SheetHeader>
        <div className="relative mt-2">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search landmarks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            autoFocus
            data-ocid="landmark-search"
          />
        </div>
        <div className="flex-1 overflow-y-auto mt-3 space-y-4">
          {Object.entries(grouped).map(([city, items]) => (
            <div key={city}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
                {city}
              </p>
              <div className="space-y-1">
                {items.map((landmark) => (
                  <button
                    key={landmark.id.toString()}
                    type="button"
                    onClick={() => {
                      onChange(landmark.id, landmark);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={cn(
                      "flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors min-h-[44px]",
                      value === landmark.id
                        ? "bg-primary/15 text-primary"
                        : "hover:bg-muted",
                    )}
                    data-ocid={`landmark-option-${landmark.id}`}
                  >
                    <span className="text-muted-foreground">
                      {typeIcons[landmark.landmarkType]}
                    </span>
                    <span className="flex-1 text-left font-medium">
                      {landmark.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {typeLabels[landmark.landmarkType]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
          {Object.keys(grouped).length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">
              No landmarks found
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
