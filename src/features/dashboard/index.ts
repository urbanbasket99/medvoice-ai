export { default as DashboardPage } from "./pages/DashboardPage";

export {
  useAiActivity,
  useAppointmentOverview,
  useKpis,
  useQuickActions,
  useRecentPatients,
} from "./hooks/useDashboardData";

export { dashboardApi } from "./api/dashboardApi";

export type {
  AiActivityEvent,
  AiActivityStatus,
  AiActivityType,
  AppointmentDayBreakdown,
  AppointmentOverview,
  AppointmentStatus,
  AppointmentStatusSlice,
  ClinicalAcuity,
  KpiIconKey,
  KpiMetric,
  KpiTrend,
  QuickAction,
  QuickActionIconKey,
  RecentPatientSummary,
  TrendDirection,
} from "./types/dashboard.types";
