import { useQuery } from "@tanstack/react-query";
import type { Landmark } from "../types";
import { useBackend } from "./useBackend";

export function useLandmarks() {
  const { actor, isFetching } = useBackend();

  return useQuery<Landmark[]>({
    queryKey: ["landmarks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLandmarks();
    },
    enabled: !!actor && !isFetching,
    staleTime: 10 * 60 * 1000, // 10 min — landmarks rarely change
  });
}

export function useLandmarksByCity(city: string) {
  const { actor, isFetching } = useBackend();

  return useQuery<Landmark[]>({
    queryKey: ["landmarks", "city", city],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLandmarksByCity(city);
    },
    enabled: !!actor && !isFetching && !!city,
    staleTime: 10 * 60 * 1000,
  });
}
