import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";

import { useAuth } from "./useAuth";
import { AuthContext, type AuthContextValue } from "../context/AuthContext";
import { createMockAuthUser } from "../../../test/fixtures/authUser";

const createWrapper =
  (value: AuthContextValue) =>
  ({ children }: { children: React.ReactNode }) => (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );

describe("useAuth", () => {
  it("returns auth context value", () => {
    const user = createMockAuthUser();
    const value: AuthContextValue = {
      user,
      isAuthenticated: true,
      isInitializing: false,
      isLoggingIn: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    };

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper(value) });
    expect(result.current.user).toEqual(user);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("throws when used outside provider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow(/AuthProvider/);
    consoleError.mockRestore();
  });
});
