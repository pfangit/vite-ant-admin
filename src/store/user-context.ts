import { createContext, useContext } from "react";
import type { CurrentUser } from "@/services/auth.ts";

export const UserContext = createContext<CurrentUser | null>(null);

export const useCurrentUser = () => useContext(UserContext);
