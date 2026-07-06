import { useMemo } from "react";
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";

import AppLayout from "./layout/AppLayout";
import type { NavItem } from "./layout/Navigation";
import type { BreadcrumbItem } from "./layout/Breadcrumbs";
import {
  AuthProvider,
  LoginPage,
  ProtectedRoute,
  PublicOnlyRoute,
  UserMenu,
  useAuth,
} from "./features/auth";
import { DashboardPage } from "./features/dashboard";
import {
  PatientDetailsPage,
  PatientEditPage,
  PatientListPage,
  PatientRegistrationPage,
} from "./features/patients";

const DASHBOARD_BREADCRUMBS: BreadcrumbItem[] = [{ id: "dashboard", label: "Dashboard" }];

/**
 * Layout route rendered for every authenticated screen: wraps whatever
 * child route is active in the shared `AppLayout` shell, and wires the
 * router-agnostic `navItems`/`headerActions` props to real navigation + the
 * signed-in user's menu. The active nav item and breadcrumb trail are
 * derived from the current path so both stay in sync as new sections
 * (Patients, and later Doctors/Appointments/...) are added.
 */
const AuthenticatedShell = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const canReadPatients = Boolean(user?.isSuperuser || user?.permissions.includes("patients:read"));
  const isPatientsSection = location.pathname.startsWith("/patients");

  const navItems = useMemo<NavItem[]>(() => {
    const items: NavItem[] = [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: <DashboardRoundedIcon fontSize="small" />,
        onClick: () => navigate("/"),
      },
    ];

    if (canReadPatients) {
      items.push({
        id: "patients",
        label: "Patients",
        icon: <PeopleAltRoundedIcon fontSize="small" />,
        onClick: () => navigate("/patients"),
      });
    }

    return items;
  }, [navigate, canReadPatients]);

  const patientsBreadcrumbs = useMemo<BreadcrumbItem[]>(
    () => [
      { id: "dashboard", label: "Dashboard", onClick: () => navigate("/") },
      { id: "patients", label: "Patients" },
    ],
    [navigate]
  );

  return (
    <AppLayout
      title="MedVoice AI HMS"
      navItems={navItems}
      activeNavId={isPatientsSection ? "patients" : "dashboard"}
      breadcrumbs={isPatientsSection ? patientsBreadcrumbs : DASHBOARD_BREADCRUMBS}
      headerActions={user && <UserMenu user={user} onLogout={logout} />}
    >
      <Outlet />
    </AppLayout>
  );
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AuthenticatedShell />}>
            <Route path="/" element={<DashboardPage />} />

            <Route element={<ProtectedRoute requiredPermission="patients:read" />}>
              <Route path="/patients" element={<PatientListPage />} />
              <Route path="/patients/:id" element={<PatientDetailsPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="patients:create" />}>
              <Route path="/patients/new" element={<PatientRegistrationPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="patients:update" />}>
              <Route path="/patients/:id/edit" element={<PatientEditPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
