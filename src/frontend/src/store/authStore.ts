import { create } from "zustand";
import type { Role } from "../backend";
import type { UserPublic } from "../types";

interface AuthState {
  user: UserPublic | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  profile: UserPublic | null;
  setUser: (user: UserPublic | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,
  profile: null,
  setUser: (user) =>
    set({
      user,
      profile: user,
      role: user?.role ?? null,
      isAuthenticated: !!user,
      isLoading: false,
    }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () =>
    set({
      user: null,
      profile: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
    }),
}));
