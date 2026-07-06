/**
 * Presentation-facing data shapes for the dashboard. These intentionally
 * mirror the shape a future real API would return (plain, JSON-serializable
 * data — no React types) so `data/mockDashboardData.ts` can later be
 * swapped for a real `api/dashboardApi.ts` implementation without touching
 * any component.
 */

export type TrendDirection = "up" | "down" | "flat";

export interface KpiTrend {
  direction: TrendDirection;
  changePercent: number;
  comparisonLabel: string;
}

export type KpiIconKey = "patients" | "appointments" | "transcriptions" | "pendingReviews";

export interface KpiMetric {
  id: string;
  label: string;
  value: string;
  icon: KpiIconKey;
  trend: KpiTrend;
}

export interface AppointmentDayBreakdown {
  date: string;
  label: string;
  scheduled: number;
  completed: number;
}

export type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "noShow";

export interface AppointmentStatusSlice {
  status: AppointmentStatus;
  label: string;
  count: number;
}

export interface AppointmentOverview {
  daily: AppointmentDayBreakdown[];
  statusBreakdown: AppointmentStatusSlice[];
}

export type AiActivityType = "transcription" | "notesGenerated" | "reviewPending";
export type AiActivityStatus = "success" | "processing" | "attention";

export interface AiActivityEvent {
  id: string;
  type: AiActivityType;
  status: AiActivityStatus;
  patientInitials: string;
  description: string;
  occurredAt: string;
}

export type ClinicalAcuity = "normal" | "abnormal" | "critical";

export interface RecentPatientSummary {
  id: string;
  displayName: string;
  reasonForVisit: string;
  lastVisitAt: string;
  acuity: ClinicalAcuity;
}

export type QuickActionIconKey = "consultation" | "search" | "schedule" | "report";

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: QuickActionIconKey;
  enabled: boolean;
}
