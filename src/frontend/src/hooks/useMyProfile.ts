import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import type { UserPublic } from "../types";
import { useBackend } from "./useBackend";

export function useMyProfile() {
  const { actor, isFetching } = useBackend();
  const { identity } = useInternetIdentity();
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);

  const query = useQuery<UserPublic | null>({
    queryKey: ["myProfile", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyProfile();
    },
    enabled: !!actor && !isFetching && !!identity,
    staleTime: 2 * 60 * 1000,
  });

  useEffect(() => {
    if (query.isLoading) {
      setLoading(true);
    } else {
      setUser(query.data ?? null);
    }
  }, [query.data, query.isLoading, setUser, setLoading]);

  return query;
}
