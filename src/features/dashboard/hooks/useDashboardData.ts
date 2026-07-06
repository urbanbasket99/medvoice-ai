import { dashboardApi } from "../api/dashboardApi";
import { useAsyncData } from "./useAsyncData";
import type { AsyncState } from "./useAsyncData";
import type {
  AiActivityEvent,
  AppointmentOverview,
  KpiMetric,
  QuickAction,
  RecentPatientSummary,
} from "../types/dashboard.types";

export const useKpis = (): AsyncState<KpiMetric[]> => useAsyncData(dashboardApi.getKpis);

export const useAppointmentOverview = (): AsyncState<AppointmentOverview> =>
  useAsyncData(dashboardApi.getAppointmentOverview);

export const useAiActivity = (): AsyncState<AiActivityEvent[]> =>
  useAsyncData(dashboardApi.getAiActivity);

export const useRecentPatients = (): AsyncState<RecentPatientSummary[]> =>
  useAsyncData(dashboardApi.getRecentPatients);

export const useQuickActions = (): AsyncState<QuickAction[]> =>
  useAsyncData(dashboardApi.getQuickActions);
