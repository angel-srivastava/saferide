import { useQuery } from "@tanstack/react-query";
import { create } from "zustand";
import { RideStatus } from "../backend";
import type { RideId, RidePublic } from "../types";
import { useBackend } from "./useBackend";

interface CurrentRideState {
  activeRideId: RideId | null;
  setActiveRideId: (id: RideId | null) => void;
}

export const useCurrentRideStore = create<CurrentRideState>((set) => ({
  activeRideId: null,
  setActiveRideId: (id) => set({ activeRideId: id }),
}));

const ACTIVE_STATUSES: RideStatus[] = [
  RideStatus.Requested,
  RideStatus.Accepted,
  RideStatus.InProgress,
];

export function useCurrentRide() {
  const { actor, isFetching } = useBackend();
  const { activeRideId, setActiveRideId } = useCurrentRideStore();

  const query = useQuery<RidePublic | null>({
    queryKey: ["currentRide", activeRideId?.toString()],
    queryFn: async () => {
      if (!actor || !activeRideId) return null;
      return actor.getRideById(activeRideId);
    },
    enabled: !!actor && !isFetching && !!activeRideId,
    refetchInterval: (q) => {
      const ride = q.state.data;
      if (ride && ACTIVE_STATUSES.includes(ride.status)) return 5000;
      return false;
    },
  });

  return { ...query, activeRideId, setActiveRideId };
}
