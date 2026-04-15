import { useActor } from "@caffeineai/core-infrastructure";
import { createActor } from "../backend";

export function useBackend() {
  return useActor(createActor);
}
