import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { authApi } from "../api/authApi";
import { setSessionExpiredHandler } from "../api/httpClient";
import { tokenStorage } from "../utils/tokenStorage";
import type { AuthUser, LoginCredentials } from "../types/auth.types";

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** True only while the initial session-restore check (on app load) is in flight. */
  isInitializing: boolean;
  isLoggingIn: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Owns all authentication state for the app. On mount it silently attempts
 * to restore a session from the `httpOnly` refresh-token cookie (the
 * access token itself never survives a page reload, since it is kept only
 * in memory — see `utils/tokenStorage.ts`).
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const clearSession = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    setSessionExpiredHandler(clearSession);
    return () => setSessionExpiredHandler(null);
  }, [clearSession]);

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const { accessToken } = await authApi.refresh();
        tokenStorage.set(accessToken);
        const currentUser = await authApi.getCurrentUser();
        if (isMounted) setUser(currentUser);
      } catch {
        if (isMounted) clearSession();
      } finally {
        if (isMounted) setIsInitializing(false);
      }
    };

    void restoreSession();

    return () => {
      isMounted = false;
    };
  }, [clearSession]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoggingIn(true);
    try {
      const result = await authApi.login(credentials);
      tokenStorage.set(result.accessToken);
      setUser(result.user);
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const refreshUser = useCallback(async () => {
    const currentUser = await authApi.getCurrentUser();
    setUser(currentUser);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isInitializing,
      isLoggingIn,
      login,
      logout,
      refreshUser,
    }),
    [user, isInitializing, isLoggingIn, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
