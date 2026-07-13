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
import ManageSearchRoundedIcon from "@mui/icons-material/ManageSearchRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import LocalHotelRoundedIcon from "@mui/icons-material/LocalHotelRounded";
import HowToRegRoundedIcon from "@mui/icons-material/HowToRegRounded";
import BiotechRoundedIcon from "@mui/icons-material/BiotechRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import AssignmentLateRoundedIcon from "@mui/icons-material/AssignmentLateRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import HotelRoundedIcon from "@mui/icons-material/HotelRounded";
import KingBedRoundedIcon from "@mui/icons-material/KingBedRounded";
import RadiologyRoundedIcon from "./features/radiology/icons/RadiologyRoundedIcon";

import AppLayout from "./layout/AppLayout";
import { resolveActiveNavId } from "./layout/resolveActiveNavId";
import { AppLogo } from "./components/ui";
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
  RetailDispensePage,
  StockHistoryPage,
  SupplierListPage,
  VendorPaymentsPage,
} from "./features/pharmacy";
import {
  InvoiceListPage,
  InvoiceCreatePage,
  InvoiceDetailsPage,
  PaymentPage,
  OutstandingBillsPage,
  TpaListPage,
  BillingReportsPage,
} from "./features/billing";
import {
  CertificateListPage,
  CertificateCreatePage,
  CertificateDetailsPage,
} from "./features/certificates";
import {
  AdmissionCreatePage,
  AdmissionDetailsPage,
  AdmissionListPage,
  BedBoardPage,
  WardListPage,
} from "./features/ipd";
import {
  AccountsPayablePage,
  CashBookPage,
  ChartOfAccountsPage,
  TrialBalancePage,
  VouchersPage,
} from "./features/accounts";
import {
  NotificationBell,
  NotificationCenterPage,
  NotificationToastProvider,
} from "./features/notifications";
import { AuditLogDetailsPage, AuditLogListPage } from "./features/audit";
import { GlobalSearchBar } from "./features/search";

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
  const canCreatePharmacy = Boolean(user?.isSuperuser || user?.permissions.includes("pharmacy:create"));
  const canReadBilling = Boolean(user?.isSuperuser || user?.permissions.includes("billing:read"));
  const canReadCertificates = Boolean(user?.isSuperuser || user?.permissions.includes("certificates:read"));
  const canReadIpd = Boolean(user?.isSuperuser || user?.permissions.includes("ipd:read"));
  const canReadAccounts = Boolean(user?.isSuperuser || user?.permissions.includes("accounts:read"));
  const canReadNotifications = Boolean(user?.isSuperuser || user?.permissions.includes("notifications:read"));
  const canReadAudit = Boolean(user?.isSuperuser || user?.permissions.includes("audit:read"));
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
  const isCertificatesSection = location.pathname.startsWith("/certificates");
  const isIpdSection = location.pathname.startsWith("/ipd");
  const isAccountsSection = location.pathname.startsWith("/accounts");
  const isNotificationsSection = location.pathname.startsWith("/notifications");
  const isAuditSection = location.pathname.startsWith("/audit");

  const navItems = useMemo<NavItem[]>(() => {
    const pushGroup = (items: NavItem[], group: NavItem) => {
      if (group.children?.length) items.push(group);
    };

    const items: NavItem[] = [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: <DashboardRoundedIcon fontSize="small" />,
        onClick: () => navigate("/"),
      },
    ];

    const frontOfficeChildren: NavItem[] = [];
    if (canReadPatients) {
      frontOfficeChildren.push({
        id: "patients",
        label: "Patients",
        icon: <PeopleAltRoundedIcon fontSize="small" />,
        onClick: () => navigate("/patients"),
      });
    }
    if (canReadAppointments) {
      frontOfficeChildren.push({
        id: "appointments",
        label: "Appointments",
        icon: <EventAvailableRoundedIcon fontSize="small" />,
        onClick: () => navigate("/appointments"),
      });
    }
    pushGroup(items, {
      id: "front-office",
      label: "Front Office",
      icon: <HowToRegRoundedIcon fontSize="small" />,
      children: frontOfficeChildren,
    });

    const opdChildren: NavItem[] = [];
    if (canReadConsultations) {
      opdChildren.push({
        id: "consultations",
        label: "Consultations",
        icon: <MedicalServicesRoundedIcon fontSize="small" />,
        onClick: () => navigate("/consultations"),
      });
    }
    if (canReadPrescriptions) {
      opdChildren.push({
        id: "prescriptions",
        label: "Prescriptions",
        icon: <MedicationRoundedIcon fontSize="small" />,
        onClick: () => navigate("/prescriptions"),
      });
    }
    if (canReadCertificates) {
      opdChildren.push({
        id: "certificates",
        label: "Certificates",
        icon: <DescriptionRoundedIcon fontSize="small" />,
        onClick: () => navigate("/certificates"),
      });
    }
    pushGroup(items, {
      id: "opd",
      label: "OPD",
      icon: <MedicalServicesRoundedIcon fontSize="small" />,
      children: opdChildren,
    });

    const ipdChildren: NavItem[] = [];
    if (canReadIpd) {
      ipdChildren.push(
        {
          id: "ipd-admissions",
          label: "Admissions",
          icon: <LocalHotelRoundedIcon fontSize="small" />,
          onClick: () => navigate("/ipd/admissions"),
        },
        {
          id: "ipd-wards",
          label: "Wards",
          icon: <HotelRoundedIcon fontSize="small" />,
          onClick: () => navigate("/ipd/wards"),
        },
        {
          id: "ipd-beds",
          label: "Bed Board",
          icon: <KingBedRoundedIcon fontSize="small" />,
          onClick: () => navigate("/ipd/beds"),
        }
      );
    }
    pushGroup(items, {
      id: "ipd",
      label: "IPD",
      icon: <LocalHotelRoundedIcon fontSize="small" />,
      children: ipdChildren,
    });

    const diagnosticsChildren: NavItem[] = [];
    if (canReadLaboratory) {
      diagnosticsChildren.push(
        {
          id: "laboratory-orders",
          label: "Lab Orders",
          icon: <ScienceRoundedIcon fontSize="small" />,
          onClick: () => navigate("/laboratory/orders"),
        },
        {
          id: "laboratory-tests",
          label: "Lab Tests",
          icon: <BiotechRoundedIcon fontSize="small" />,
          onClick: () => navigate("/laboratory/tests"),
        }
      );
    }
    if (canReadRadiology) {
      diagnosticsChildren.push(
        {
          id: "radiology-orders",
          label: "Radiology Orders",
          icon: <RadiologyRoundedIcon fontSize="small" />,
          onClick: () => navigate("/radiology/orders"),
        },
        {
          id: "radiology-tests",
          label: "Radiology Tests",
          icon: <RadiologyRoundedIcon fontSize="small" />,
          onClick: () => navigate("/radiology/tests"),
        }
      );
    }
    pushGroup(items, {
      id: "diagnostics",
      label: "Diagnostics",
      icon: <BiotechRoundedIcon fontSize="small" />,
      children: diagnosticsChildren,
    });

    const pharmacyChildren: NavItem[] = [];
    if (canReadPharmacy) {
      pharmacyChildren.push(
        {
          id: "pharmacy-dispense",
          label: "Dispense",
          icon: <LocalPharmacyRoundedIcon fontSize="small" />,
          onClick: () => navigate("/pharmacy/dispense"),
        },
        ...(canCreatePharmacy
          ? [
              {
                id: "pharmacy-retail",
                label: "Retail Dispense",
                icon: <StorefrontRoundedIcon fontSize="small" />,
                onClick: () => navigate("/pharmacy/dispense/retail"),
              } satisfies NavItem,
            ]
          : []),
        {
          id: "pharmacy-medicines",
          label: "Medicines",
          icon: <MedicationRoundedIcon fontSize="small" />,
          onClick: () => navigate("/pharmacy/medicines"),
        },
        {
          id: "pharmacy-inventory",
          label: "Inventory",
          icon: <Inventory2RoundedIcon fontSize="small" />,
          onClick: () => navigate("/pharmacy/inventory"),
        },
        {
          id: "pharmacy-suppliers",
          label: "Suppliers",
          icon: <StorefrontRoundedIcon fontSize="small" />,
          onClick: () => navigate("/pharmacy/suppliers"),
        },
        {
          id: "pharmacy-vendor-payments",
          label: "Vendor Payments",
          icon: <PaymentsRoundedIcon fontSize="small" />,
          onClick: () => navigate("/pharmacy/vendor-payments"),
        }
      );
    }
    pushGroup(items, {
      id: "pharmacy",
      label: "Pharmacy",
      icon: <LocalPharmacyRoundedIcon fontSize="small" />,
      children: pharmacyChildren,
    });

    const billingChildren: NavItem[] = [];
    if (canReadBilling) {
      billingChildren.push(
        {
          id: "billing-invoices",
          label: "Invoices",
          icon: <ReceiptLongRoundedIcon fontSize="small" />,
          onClick: () => navigate("/billing/invoices"),
        },
        {
          id: "billing-outstanding",
          label: "Outstanding",
          icon: <AssignmentLateRoundedIcon fontSize="small" />,
          onClick: () => navigate("/billing/outstanding"),
        },
        {
          id: "billing-tpas",
          label: "TPA",
          icon: <AccountBalanceRoundedIcon fontSize="small" />,
          onClick: () => navigate("/billing/tpas"),
        },
        {
          id: "billing-reports",
          label: "Reports",
          icon: <AssessmentRoundedIcon fontSize="small" />,
          onClick: () => navigate("/billing/reports"),
        }
      );
    }
    pushGroup(items, {
      id: "billing",
      label: "Billing & Insurance",
      icon: <ReceiptLongRoundedIcon fontSize="small" />,
      children: billingChildren,
    });

    const accountsChildren: NavItem[] = [];
    if (canReadAccounts) {
      accountsChildren.push(
        {
          id: "accounts-chart",
          label: "Chart of Accounts",
          icon: <AccountBalanceRoundedIcon fontSize="small" />,
          onClick: () => navigate("/accounts/chart"),
        },
        {
          id: "accounts-vouchers",
          label: "Vouchers",
          icon: <ReceiptLongRoundedIcon fontSize="small" />,
          onClick: () => navigate("/accounts/vouchers"),
        },
        {
          id: "accounts-cash-book",
          label: "Cash Book",
          icon: <PaymentsRoundedIcon fontSize="small" />,
          onClick: () => navigate("/accounts/cash-book"),
        },
        {
          id: "accounts-trial-balance",
          label: "Trial Balance",
          icon: <AssessmentRoundedIcon fontSize="small" />,
          onClick: () => navigate("/accounts/trial-balance"),
        },
        {
          id: "accounts-ap",
          label: "Accounts Payable",
          icon: <AssignmentLateRoundedIcon fontSize="small" />,
          onClick: () => navigate("/accounts/ap"),
        }
      );
    }
    pushGroup(items, {
      id: "accounts",
      label: "Accounts & Finance",
      icon: <AccountBalanceRoundedIcon fontSize="small" />,
      children: accountsChildren,
    });

    const mastersChildren: NavItem[] = [];
    if (canReadDoctors) {
      mastersChildren.push({
        id: "doctors",
        label: "Doctors",
        icon: <LocalHospitalRoundedIcon fontSize="small" />,
        onClick: () => navigate("/doctors"),
      });
    }
    pushGroup(items, {
      id: "masters",
      label: "Masters",
      icon: <MenuBookRoundedIcon fontSize="small" />,
      children: mastersChildren,
    });

    const medvoiceChildren: NavItem[] = [];
    if (canRecordVoice) {
      medvoiceChildren.push({
        id: "voice-record",
        label: "Voice Recorder",
        icon: <MicRoundedIcon fontSize="small" />,
        onClick: () => navigate("/voice/record"),
      });
    }
    if (canReadVoice) {
      medvoiceChildren.push({
        id: "voice-history",
        label: "Recordings",
        icon: <MicRoundedIcon fontSize="small" />,
        onClick: () => navigate("/voice/history"),
      });
    }
    if (canReadTranscriptions) {
      medvoiceChildren.push({
        id: "transcriptions",
        label: "Transcriptions",
        icon: <ArticleRoundedIcon fontSize="small" />,
        onClick: () => navigate("/transcriptions"),
      });
    }
    if (canReadAi) {
      medvoiceChildren.push({
        id: "ai",
        label: "AI Engine",
        icon: <SmartToyRoundedIcon fontSize="small" />,
        onClick: () => navigate("/ai/settings"),
      });
    }
    pushGroup(items, {
      id: "medvoice-ai",
      label: "MedVoice AI",
      icon: <AutoAwesomeRoundedIcon fontSize="small" />,
      children: medvoiceChildren,
    });

    const adminChildren: NavItem[] = [];
    if (canReadNotifications) {
      adminChildren.push({
        id: "notifications",
        label: "Notifications",
        icon: <NotificationsRoundedIcon fontSize="small" />,
        onClick: () => navigate("/notifications"),
      });
    }
    if (canReadAudit) {
      adminChildren.push({
        id: "audit-logs",
        label: "Audit Logs",
        icon: <ManageSearchRoundedIcon fontSize="small" />,
        onClick: () => navigate("/audit/logs"),
      });
    }
    pushGroup(items, {
      id: "administration",
      label: "Administration",
      icon: <AdminPanelSettingsRoundedIcon fontSize="small" />,
      children: adminChildren,
    });

    return items;
  }, [
    navigate,
    canReadPatients,
    canReadDoctors,
    canReadAppointments,
    canReadConsultations,
    canReadPrescriptions,
    canReadLaboratory,
    canReadRadiology,
    canReadPharmacy,
    canCreatePharmacy,
    canReadBilling,
    canReadCertificates,
    canReadIpd,
    canReadAccounts,
    canReadVoice,
    canRecordVoice,
    canReadAi,
    canReadTranscriptions,
    canReadNotifications,
    canReadAudit,
  ]);

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

  const certificatesBreadcrumbs = useMemo<BreadcrumbItem[]>(
    () => [
      { id: "dashboard", label: "Dashboard", onClick: () => navigate("/") },
      { id: "certificates", label: "Certificates" },
    ],
    [navigate]
  );

  const ipdBreadcrumbs = useMemo<BreadcrumbItem[]>(
    () => [
      { id: "dashboard", label: "Dashboard", onClick: () => navigate("/") },
      { id: "ipd", label: "IPD" },
    ],
    [navigate]
  );

  const accountsBreadcrumbs = useMemo<BreadcrumbItem[]>(
    () => [
      { id: "dashboard", label: "Dashboard", onClick: () => navigate("/") },
      { id: "accounts", label: "Accounts" },
    ],
    [navigate]
  );

  const notificationsBreadcrumbs = useMemo<BreadcrumbItem[]>(
    () => [
      { id: "dashboard", label: "Dashboard", onClick: () => navigate("/") },
      { id: "notifications", label: "Notifications" },
    ],
    [navigate]
  );

  const auditBreadcrumbs = useMemo<BreadcrumbItem[]>(
    () => [
      { id: "dashboard", label: "Dashboard", onClick: () => navigate("/") },
      { id: "audit", label: "Audit Logs" },
    ],
    [navigate]
  );

  const activeNavId = resolveActiveNavId(location.pathname);
  const breadcrumbs = isAuditSection
    ? auditBreadcrumbs
    : isNotificationsSection
    ? notificationsBreadcrumbs
    : isAccountsSection
    ? accountsBreadcrumbs
    : isIpdSection
    ? ipdBreadcrumbs
    : isCertificatesSection
    ? certificatesBreadcrumbs
    : isBillingSection
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
    <NotificationToastProvider>
      <AppLayout
        logo={<AppLogo size={32} />}
        navItems={navItems}
        activeNavId={activeNavId}
        breadcrumbs={breadcrumbs}
        headerActions={
          user && (
            <>
              <GlobalSearchBar />
              <NotificationBell />
              <UserMenu user={user} onLogout={logout} />
            </>
          )
        }
      >
        <Outlet />
      </AppLayout>
    </NotificationToastProvider>
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
              <Route path="/pharmacy/suppliers" element={<SupplierListPage />} />
              <Route path="/pharmacy/vendor-payments" element={<VendorPaymentsPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="pharmacy:create" />}>
              <Route path="/pharmacy/dispense/new" element={<DispensePrescriptionPage />} />
              <Route path="/pharmacy/dispense/retail" element={<RetailDispensePage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission="billing:read" />}>
              <Route path="/billing/invoices" element={<InvoiceListPage />} />
              <Route path="/billing/invoices/:id" element={<InvoiceDetailsPage />} />
              <Route path="/billing/outstanding" element={<OutstandingBillsPage />} />
              <Route path="/billing/tpas" element={<TpaListPage />} />
              <Route path="/billing/reports" element={<BillingReportsPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="billing:create" />}>
              <Route path="/billing/invoices/new" element={<InvoiceCreatePage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="billing:update" />}>
              <Route path="/billing/invoices/:id/payment" element={<PaymentPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission="certificates:create" />}>
              <Route path="/certificates/new" element={<CertificateCreatePage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="certificates:read" />}>
              <Route path="/certificates" element={<CertificateListPage />} />
              <Route path="/certificates/:id" element={<CertificateDetailsPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission="ipd:read" />}>
              <Route path="/ipd/wards" element={<WardListPage />} />
              <Route path="/ipd/beds" element={<BedBoardPage />} />
              <Route path="/ipd/admissions" element={<AdmissionListPage />} />
              <Route path="/ipd/admissions/:id" element={<AdmissionDetailsPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="ipd:create" />}>
              <Route path="/ipd/admissions/new" element={<AdmissionCreatePage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="ipd:update" />}>
              <Route path="/ipd/admissions/:id/discharge" element={<AdmissionDetailsPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission="accounts:read" />}>
              <Route path="/accounts/chart" element={<ChartOfAccountsPage />} />
              <Route path="/accounts/vouchers" element={<VouchersPage />} />
              <Route path="/accounts/cash-book" element={<CashBookPage />} />
              <Route path="/accounts/trial-balance" element={<TrialBalancePage />} />
              <Route path="/accounts/ap" element={<AccountsPayablePage />} />
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

            <Route element={<ProtectedRoute requiredPermission="notifications:read" />}>
              <Route path="/notifications" element={<NotificationCenterPage />} />
            </Route>

            <Route element={<ProtectedRoute requiredPermission="audit:read" />}>
              <Route path="/audit/logs" element={<AuditLogListPage />} />
              <Route path="/audit/logs/:id" element={<AuditLogDetailsPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
