import type { CurrentUser } from "@/services/auth.ts";
import { createStore } from "./create-store.tsx";

interface AuthState {
  user: CurrentUser | null;
  setUser: (user: CurrentUser | null) => void;
  clear: () => void;
}

export const useAuthStore = createStore<AuthState>(
  (set) => ({
    user: null,
    setUser: (user) => set({ user }),
    clear: () => set({ user: null }),
  }),
  "auth",
);
