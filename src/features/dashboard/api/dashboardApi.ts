import {
  mockAiActivity,
  mockAppointmentOverview,
  mockKpis,
  mockQuickActions,
  mockRecentPatients,
} from "../data/mockDashboardData";
import type {
  AiActivityEvent,
  AppointmentOverview,
  KpiMetric,
  QuickAction,
  RecentPatientSummary,
} from "../types/dashboard.types";

/**
 * Mock data source shaped exactly like a real HTTP client module
 * (compare to `features/auth/api/authApi.ts`): every function is async and
 * returns the same types a real backend call would. Swapping this file for
 * one backed by `httpClient` later requires no changes anywhere else in
 * the feature.
 */
const simulateNetworkDelay = (minMs = 250, maxMs = 600): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, minMs + Math.random() * (maxMs - minMs)));

export const dashboardApi = {
  async getKpis(): Promise<KpiMetric[]> {
    await simulateNetworkDelay();
    return mockKpis;
  },

  async getAppointmentOverview(): Promise<AppointmentOverview> {
    await simulateNetworkDelay();
    return mockAppointmentOverview;
  },

  async getAiActivity(): Promise<AiActivityEvent[]> {
    await simulateNetworkDelay();
    return mockAiActivity;
  },

  async getRecentPatients(): Promise<RecentPatientSummary[]> {
    await simulateNetworkDelay();
    return mockRecentPatients;
  },

  async getQuickActions(): Promise<QuickAction[]> {
    await simulateNetworkDelay(100, 200);
    return mockQuickActions;
  },
};
