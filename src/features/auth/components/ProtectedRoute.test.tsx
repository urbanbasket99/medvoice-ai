import { describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";
import { screen } from "@testing-library/react";

import ProtectedRoute from "./ProtectedRoute";
import { renderWithProviders } from "../../../test/test-utils";
import { createMockAuthUser } from "../../../test/fixtures/authUser";

const useAuthMock = vi.fn();

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => useAuthMock(),
}));

describe("ProtectedRoute", () => {
  it("shows spinner while initializing", () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      isInitializing: true,
      user: null,
    });

    renderWithProviders(
      <ProtectedRoute>
        <div>Secret</div>
      </ProtectedRoute>,
      { route: "/patients" },
    );

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("redirects unauthenticated users to login", () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      isInitializing: false,
      user: null,
    });

    renderWithProviders(
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/patients" element={<div>Patients</div>} />
        </Route>
      </Routes>,
      { route: "/patients" },
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("renders children when authenticated with permission", () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      isInitializing: false,
      user: createMockAuthUser({ permissions: ["patients:read"] }),
    });

    renderWithProviders(
      <ProtectedRoute requiredPermission="patients:read">
        <div>Patients Area</div>
      </ProtectedRoute>,
      { route: "/patients" },
    );

    expect(screen.getByText("Patients Area")).toBeInTheDocument();
  });

  it("redirects when permission is missing", () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      isInitializing: false,
      user: createMockAuthUser({ isSuperuser: false, permissions: [] }),
    });

    renderWithProviders(
      <Routes>
        <Route path="/" element={<div>Dashboard</div>} />
        <Route
          path="/billing"
          element={
            <ProtectedRoute requiredPermission="billing:read">
              <div>Billing</div>
            </ProtectedRoute>
          }
        />
      </Routes>,
      { route: "/billing" },
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });
});
