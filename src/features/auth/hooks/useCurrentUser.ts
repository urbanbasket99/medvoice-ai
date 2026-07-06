import { useAuth } from "./useAuth";
import type { AuthUser } from "../types/auth.types";

/**
 * Convenience selector for the currently authenticated user. Returns
 * `null` while the session is initializing or when signed out — callers
 * that require a non-null user should render behind `ProtectedRoute`.
 */
export const useCurrentUser = (): AuthUser | null => {
  const { user } = useAuth();
  return user;
};
