import { useMemo } from "react";
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import MedicalServicesRoundedIcon from "@mui/icons-material/MedicalServicesRounded";
import MicRoundedIcon from "@mui/icons-material/MicRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import MedicationRoundedIcon from "@mui/icons-material/MedicationRounded";
import LocalPharmacyRoundedIcon from "@mui/icons-material/LocalPharmacyRounded";
import ScienceRoundedIcon from "@mui/icons-material/ScienceRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import RadiologyRoundedIcon from "./features/radiology/icons/RadiologyRoundedIcon";

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
import {
  DoctorDetailsPage,
  DoctorEditPage,
  DoctorListPage,
  DoctorRegistrationPage,
} from "./features/doctors";
import {
  AppointmentCreatePage,
  AppointmentDetailsPage,
  AppointmentEditPage,
  AppointmentListPage,
} from "./features/appointments";
import {
  ConsultationCreatePage,
  ConsultationDetailsPage,
  ConsultationEditorPage,
  ConsultationListPage,
} from "./features/consultations";
import { RecordingHistoryPage, VoiceRecorderPage } from "./features/voice";
import { AiSettingsPage } from "./features/ai";
import { TranscriptionHistoryPage, TranscriptionViewerPage } from "./features/transcription";
import {
  PrescriptionCreatePage,
  PrescriptionDetailsPage,
  PrescriptionEditPage,
  PrescriptionListPage,
} from "./features/prescriptions";
import {
  LabOrderCreatePage,
  LabOrderDetailsPage,
  LabOrderListPage,
  LabTestMasterPage,
} from "./features/laboratory";
import {
  RadiologyOrderCreatePage,
  RadiologyOrderDetailsPage,
  RadiologyOrderListPage,
  RadiologyTestMasterPage,
} from "./features/radiology";
import {
  BatchManagementPage,
  DispenseDetailsPage,
  DispenseListPage,
  DispensePrescriptionPage,
  LowStockDashboardPage,
  MedicineInventoryPage,
  MedicineMasterPage,
  StockHistoryPage,
} from "./features/pharmacy";
import {
  InvoiceListPage,
  InvoiceCreatePage,
  InvoiceDetailsPage,
  PaymentPage,
  OutstandingBillsPage,
} from "./features/billing";

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
  const canReadDoctors = Boolean(user?.isSuperuser || user?.permissions.includes("doctors:read"));
  const canReadAppointments = Boolean(user?.isSuperuser || user?.permissions.includes("appointments:read"));
  const canReadConsultations = Boolean(user?.isSuperuser || user?.permissions.includes("consultations:read"));
  const canReadVoice = Boolean(user?.isSuperuser || user?.permissions.includes("voice:read"));
  const canRecordVoice = Boolean(user?.isSuperuser || user?.permissions.includes("voice:record"));
  const canReadAi = Boolean(user?.isSuperuser || user?.permissions.includes("ai:read"));
  const canReadTranscriptions = Boolean(user?.isSuperuser || user?.permissions.includes("transcriptions:read"));
  const canReadPrescriptions = Boolean(user?.isSuperuser || user?.permissions.includes("prescriptions:read"));
  const canReadLaboratory = Boolean(user?.isSuperuser || user?.permissions.includes("laboratory:read"));
  const canReadRadiology = Boolean(user?.isSuperuser || user?.permissions.includes("radiology:read"));
  const canReadPharmacy = Boolean(user?.isSuperuser || user?.permissions.includes("pharmacy:read"));
  const canReadBilling = Boolean(user?.isSuperuser || user?.permissions.includes("billing:read"));
  const isPatientsSection = location.pathname.startsWith("/patients");
  const isDoctorsSection = location.pathname.startsWith("/doctors");
  const isAppointmentsSection = location.pathname.startsWith("/appointments");
  const isConsultationsSection = location.pathname.startsWith("/consultations");
  const isVoiceSection = location.pathname.startsWith("/voice");
  const isAiSection = location.pathname.startsWith("/ai");
  const isTranscriptionsSection = location.pathname.startsWith("/transcriptions");
  const isPrescriptionsSection = location.pathname.startsWith("/prescriptions");
  const isLaboratorySection = location.pathname.startsWith("/laboratory");
  const isRadiologySection = location.pathname.startsWith("/radiology");
  const isPharmacySection = location.pathname.startsWith("/pharmacy");
  const isBillingSection = location.pathname.startsWith("/billing");

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

    if (canReadDoctors) {
      items.push({
        id: "doctors",
        label: "Doctors",
        icon: <LocalHospitalRoundedIcon fontSize="small" />,
        onClick: () => navigate("/doctors"),
      });
    }

    if (canReadAppointments) {
      items.push({
        id: "appointments",
        label: "Appointments",
        icon: <EventAvailableRoundedIcon fontSize="small" />,
        onClick: () => navigate("/appointments"),
      });
    }

    if (canReadConsultations) {
      items.push({
        id: "consultations",
        label: "Consultations",
        icon: <MedicalServicesRoundedIcon fontSize="small" />,
        onClick: () => navigate("/consultations"),
      });
    }

    if (canReadPrescriptions) {
      items.push({
        id: "prescriptions",
        label: "Prescriptions",
        icon: <MedicationRoundedIcon fontSize="small" />,
        onClick: () => navigate("/prescriptions"),
      });
    }

    if (canReadLaboratory) {
      items.push({
        id: "laboratory",
        label: "Laboratory",
        icon: <ScienceRoundedIcon fontSize="small" />,
        onClick: () => navigate("/laboratory/orders"),
      });
    }

    if (canReadRadiology) {
      items.push({
        id: "radiology",
        label: "Radiology",
        icon: <RadiologyRoundedIcon fontSize="small" />,
        onClick: () => navigate("/radiology/orders"),
      });
    }

    if (canReadPharmacy) {
      items.push({
        id: "pharmacy",
        label: "Pharmacy",
        icon: <LocalPharmacyRoundedIcon fontSize="small" />,
        onClick: () => navigate("/pharmacy/dispense"),
      });
    }

    if (canReadBilling) {
      items.push({
        id: "billing",
        label: "Billing",
        icon: <ReceiptLongRoundedIcon fontSize="small" />,
        onClick: () => navigate("/billing/invoices"),
      });
    }

    if (canReadVoice || canRecordVoice) {
      items.push({
        id: "voice",
        label: "Voice",
        icon: <MicRoundedIcon fontSize="small" />,
        onClick: () => navigate(canRecordVoice ? "/voice/record" : "/voice/history"),
      });
    }

    if (canReadAi) {
      items.push({
        id: "ai",
        label: "AI Engine",
        icon: <SmartToyRoundedIcon fontSize="small" />,
        onClick: () => navigate("/ai/settings"),
      });
    }

    if (canReadTranscriptions) {
      items.push({
        id: "transcriptions",
        label: "Transcriptions",
        icon: <ArticleRoundedIcon fontSize="small" />,
        onClick: () => navigate("/transcriptions"),
      });
    }

    return items;
  }, [navigate, canReadPatients, canReadDoctors, canReadAppointments, canReadConsultations, canReadPrescriptions, canReadLaboratory, canReadRadiology, canReadPharmacy, canReadBilling, canReadVoice, canRecordVoice, canReadAi, canReadTranscriptions]);

  const patientsBreadcrumbs = useMemo<BreadcrumbItem[]>(
    () => [
      { id: "dashboard", label: "Dashboard", onClick: () => navigate("/") },
      { id: "patients", label: "Patients" },
    ],
    [navigate]
  );

  const doctorsBreadcrumbs = useMemo<BreadcrumbItem[]>(
    () => [
      { id: "dashboard", label: "Dashboard", onClick: () => navigate("/") },
      { id: "doctors", label: "Doctors" },
    ],
    [navigate]
  );

  const appointmentsBreadcrumbs = useMemo<BreadcrumbItem[]>(
    () => [
      { id: "dashboard", label: "Dashboard", onClick: () => navigate("/") },
      { id: "appointments", label: "Appointments" },
    ],
    [navigate]
  );

  const consultationsBreadcrumbs = useMemo<BreadcrumbItem[]>(
    () => [
      { id: "dashboard", label: "Dashboard", onClick: () => navigate("/") },
      { id: "consultations", label: "Consultations" },
    ],
    [navigate]
  );

  const voiceBreadcrumbs = useMemo<BreadcrumbItem[]>(
    () => [
      { id: "dashboard", label: "Dashboard", onClick: () => navigate("/") },
      { id: "voice", label: "Voice" },
    ],
    [navigate]
  );

  const aiBreadcrumbs = useMemo<BreadcrumbItem[]>(
    () => [
      { id: "dashboard", label: "Dashboard", onClick: () => navigate("/") },
      { id: "ai", label: "AI Engine" },
    ],
    [navigate]
  );

  const transcriptionsBreadcrumbs = useMemo<BreadcrumbItem[]>(
    () => [
      { id: "dashboard", label: "Dashboard", onClick: () => navigate("/") },
      { id: "transcriptions", label: "Transcriptions" },
    ],
    [navigate]
  );

  const prescriptionsBreadcrumbs = useMemo<BreadcrumbItem[]>(
    () => [
      { id: "dashboard", label: "Dashboard", onClick: () => navigate("/") },
      { id: "prescriptions", label: "Prescriptions" },
    ],
    [navigate]
  );

  const laboratoryBreadcrumbs = useMemo<BreadcrumbItem[]>(
    () => [
      { id: "dashboard", label: "Dashboard", onClick: () => navigate("/") },
      { id: "laboratory", label: "Laboratory" },
    ],
    [navigate]
  );

  const radiologyBreadcrumbs = useMemo<BreadcrumbItem[]>(
    () => [
      { id: "dashboard", label: "Dashboard", onClick: () => navigate("/") },
      { id: "radiology", label: "Radiology" },
    ],
    [navigate]
  );

  const pharmacyBreadcrumbs = useMemo<BreadcrumbItem[]>(
    () => [
      { id: "dashboard", label: "Dashboard", onClick: () => navigate("/") },
      { id: "pharmacy", label: "Pharmacy" },
    ],
    [navigate]
  );

  const billingBreadcrumbs = useMemo<BreadcrumbItem[]>(
    () => [
      { id: "dashboard", label: "Dashboard", onClick: () => navigate("/") },
      { id: "billing", label: "Billing" },
    ],
    [navigate]
  );

  const activeNavId = isBillingSection
    ? "billing"
    : isPharmacySection
    ? "pharmacy"
    : isRadiologySection
    ? "radiology"
    : isLaboratorySection
    ? "laboratory"
    : isPrescriptionsSection
    ? "prescriptions"
    : isTranscriptionsSection
    ? "transcriptions"
    : isAiSection
    ? "ai"
    : isVoiceSection
    ? "voice"
    : isConsultationsSection
    ? "consultations"
    : isAppointmentsSection
      ? "appointments"
      : isDoctorsSection
        ? "doctors"
        : isPatientsSection
          ? "patients"
          : "dashboard";
  const breadcrumbs = isBillingSection
    ? billingBreadcrumbs
    : isPharmacySection
    ? pharmacyBreadcrumbs
    : isRadiologySection
    ? radiologyBreadcrumbs
    : isLaboratorySection
    ? laboratoryBreadcrumbs
    : isPrescriptionsSection
    ? prescriptionsBreadcrumbs
    : isTranscriptionsSection
    ? transcriptionsBreadcrumbs
    : isAiSection
    ? aiBreadcrumbs
    : isVoiceSection
    ? voiceBreadcrumbs
    : isConsultationsSection
    ? consultationsBreadcrumbs
    : isAppointmentsSection
      ? appointmentsBreadcrumbs
      : isDoctorsSection
        ? doctorsBreadcrumbs
        : isPatientsSection
          ? patientsBreadcrumbs
          : DASHBOARD_BREADCRUMBS;

  return (
    <AppLayout
      title="MedVoice AI HMS"
      navItems={navItems}
      activeNavId={activeNavId}
      breadcrumbs={breadcrumbs}
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

            <Route element={<ProtectedRoute requiredPermission="doctors:read" />}>
              <Route path="/doctors" element={<DoctorListPage />} />
              <Route path="/doctors/:id" element={<DoctorDetailsPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="doctors:create" />}>
              <Route path="/doctors/new" element={<DoctorRegistrationPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="doctors:update" />}>
              <Route path="/doctors/:id/edit" element={<DoctorEditPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission="appointments:read" />}>
              <Route path="/appointments" element={<AppointmentListPage />} />
              <Route path="/appointments/:id" element={<AppointmentDetailsPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="appointments:create" />}>
              <Route path="/appointments/new" element={<AppointmentCreatePage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="appointments:update" />}>
              <Route path="/appointments/:id/edit" element={<AppointmentEditPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission="consultations:read" />}>
              <Route path="/consultations" element={<ConsultationListPage />} />
              <Route path="/consultations/:id" element={<ConsultationDetailsPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="consultations:create" />}>
              <Route path="/consultations/new" element={<ConsultationCreatePage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="consultations:update" />}>
              <Route path="/consultations/:id/edit" element={<ConsultationEditorPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission="prescriptions:read" />}>
              <Route path="/prescriptions" element={<PrescriptionListPage />} />
              <Route path="/prescriptions/:id" element={<PrescriptionDetailsPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="prescriptions:create" />}>
              <Route path="/prescriptions/new" element={<PrescriptionCreatePage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="prescriptions:update" />}>
              <Route path="/prescriptions/:id/edit" element={<PrescriptionEditPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission="laboratory:read" />}>
              <Route path="/laboratory/orders" element={<LabOrderListPage />} />
              <Route path="/laboratory/orders/:id" element={<LabOrderDetailsPage />} />
              <Route path="/laboratory/tests" element={<LabTestMasterPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="laboratory:create" />}>
              <Route path="/laboratory/orders/new" element={<LabOrderCreatePage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission="radiology:read" />}>
              <Route path="/radiology/orders" element={<RadiologyOrderListPage />} />
              <Route path="/radiology/orders/:id" element={<RadiologyOrderDetailsPage />} />
              <Route path="/radiology/tests" element={<RadiologyTestMasterPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="radiology:create" />}>
              <Route path="/radiology/orders/new" element={<RadiologyOrderCreatePage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission="pharmacy:read" />}>
              <Route path="/pharmacy/medicines" element={<MedicineMasterPage />} />
              <Route path="/pharmacy/inventory" element={<MedicineInventoryPage />} />
              <Route path="/pharmacy/dispense" element={<DispenseListPage />} />
              <Route path="/pharmacy/dispense/:id" element={<DispenseDetailsPage />} />
              <Route path="/pharmacy/batches" element={<BatchManagementPage />} />
              <Route path="/pharmacy/stock/history" element={<StockHistoryPage />} />
              <Route path="/pharmacy/stock/low" element={<LowStockDashboardPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="pharmacy:create" />}>
              <Route path="/pharmacy/dispense/new" element={<DispensePrescriptionPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission="billing:read" />}>
              <Route path="/billing/invoices" element={<InvoiceListPage />} />
              <Route path="/billing/invoices/:id" element={<InvoiceDetailsPage />} />
              <Route path="/billing/outstanding" element={<OutstandingBillsPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="billing:create" />}>
              <Route path="/billing/invoices/new" element={<InvoiceCreatePage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="billing:update" />}>
              <Route path="/billing/invoices/:id/payment" element={<PaymentPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission="voice:read" />}>
              <Route path="/voice/history" element={<RecordingHistoryPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="voice:record" />}>
              <Route path="/voice/record" element={<VoiceRecorderPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission="ai:read" />}>
              <Route path="/ai/settings" element={<AiSettingsPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission="transcriptions:read" />}>
              <Route path="/transcriptions" element={<TranscriptionHistoryPage />} />
              <Route path="/transcriptions/:id" element={<TranscriptionViewerPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
