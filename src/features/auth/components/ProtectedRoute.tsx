import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

import { useAuth } from "../hooks/useAuth";

export interface ProtectedRouteProps {
  children?: ReactNode;
  redirectTo?: string;
  requiredPermission?: string;
  requiredRole?: string;
}

/**
 * Guards a route (or subtree, via `<Outlet />`) behind authentication and,
 * optionally, a specific permission/role (RBAC). Unauthenticated visitors
 * are redirected to `redirectTo` with the attempted location preserved in
 * router state so `LoginPage` can send them back after signing in.
 */
const ProtectedRoute = ({
  children,
  redirectTo = "/login",
  requiredPermission,
  requiredRole,
}: ProtectedRouteProps) => {
  const { isAuthenticated, isInitializing, user } = useAuth();
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

  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  const hasPermission =
    !requiredPermission || user.isSuperuser || user.permissions.includes(requiredPermission);
  const hasRole = !requiredRole || user.isSuperuser || user.roles.includes(requiredRole);

  if (!hasPermission || !hasRole) {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
