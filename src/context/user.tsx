import { createContext } from "react";
import type {CurrentUser} from "@/services/auth.ts";

export const userContext = createContext<CurrentUser | undefined>(undefined);
