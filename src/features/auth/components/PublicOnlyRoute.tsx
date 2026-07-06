import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

import { useAuth } from "../hooks/useAuth";

export interface PublicOnlyRouteProps {
  children?: ReactNode;
  redirectTo?: string;
}

interface RedirectLocationState {
  from?: { pathname: string };
}

/**
 * Inverse of `ProtectedRoute` — for pages (login, forgot-password) that
 * should not be reachable while already signed in. Sends authenticated
 * visitors to wherever they were headed before being bounced to login, or
 * to `redirectTo` otherwise.
 */
const PublicOnlyRoute = ({ children, redirectTo = "/" }: PublicOnlyRouteProps) => {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isAuthenticated) {
    const state = location.state as RedirectLocationState | null;
    return <Navigate to={state?.from?.pathname ?? redirectTo} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default PublicOnlyRoute;
