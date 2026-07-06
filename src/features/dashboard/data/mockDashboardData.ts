import type {
  AiActivityEvent,
  AppointmentOverview,
  KpiMetric,
  QuickAction,
  RecentPatientSummary,
} from "../types/dashboard.types";

/**
 * Static, hand-authored mock data. This is the only file in the dashboard
 * feature that "knows" it isn't real — everything else (hooks, components)
 * is written as if `api/dashboardApi.ts` were hitting a real backend.
 */

const hoursAgo = (hours: number): string =>
  new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

export const mockKpis: KpiMetric[] = [
  {
    id: "patients-today",
    label: "Today's Patients",
    value: "18",
    icon: "patients",
    trend: { direction: "up", changePercent: 12, comparisonLabel: "vs yesterday" },
  },
  {
    id: "appointments-today",
    label: "Today's Appointments",
    value: "24",
    icon: "appointments",
    trend: { direction: "down", changePercent: 4, comparisonLabel: "vs yesterday" },
  },
  {
    id: "ai-transcriptions",
    label: "AI Transcriptions",
    value: "15",
    icon: "transcriptions",
    trend: { direction: "up", changePercent: 32, comparisonLabel: "vs last week" },
  },
  {
    id: "pending-reviews",
    label: "Pending Reviews",
    value: "3",
    icon: "pendingReviews",
    trend: { direction: "flat", changePercent: 0, comparisonLabel: "vs yesterday" },
  },
];

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const mockAppointmentOverview: AppointmentOverview = {
  daily: dayLabels.map((label, index) => ({
    date: label,
    label,
    scheduled: [26, 22, 30, 28, 24, 12, 8][index],
    completed: [24, 20, 27, 25, 21, 10, 6][index],
  })),
  statusBreakdown: [
    { status: "completed", label: "Completed", count: 133 },
    { status: "scheduled", label: "Scheduled", count: 18 },
    { status: "cancelled", label: "Cancelled", count: 7 },
    { status: "noShow", label: "No-show", count: 4 },
  ],
};

export const mockAiActivity: AiActivityEvent[] = [
  {
    id: "ai-1",
    type: "transcription",
    status: "success",
    patientInitials: "R.K.",
    description: "Voice consultation transcribed automatically",
    occurredAt: hoursAgo(0.15),
  },
  {
    id: "ai-2",
    type: "notesGenerated",
    status: "success",
    patientInitials: "A.M.",
    description: "Structured medical notes generated from transcript",
    occurredAt: hoursAgo(0.6),
  },
  {
    id: "ai-3",
    type: "reviewPending",
    status: "attention",
    patientInitials: "S.P.",
    description: "AI-generated notes flagged for physician review",
    occurredAt: hoursAgo(1.2),
  },
  {
    id: "ai-4",
    type: "transcription",
    status: "processing",
    patientInitials: "J.C.",
    description: "Transcription in progress",
    occurredAt: hoursAgo(0.05),
  },
  {
    id: "ai-5",
    type: "notesGenerated",
    status: "success",
    patientInitials: "N.D.",
    description: "Structured medical notes generated from transcript",
    occurredAt: hoursAgo(3.5),
  },
];

export const mockRecentPatients: RecentPatientSummary[] = [
  {
    id: "patient-1",
    displayName: "Aarav Mehta",
    reasonForVisit: "Routine follow-up",
    lastVisitAt: hoursAgo(0.5),
    acuity: "normal",
  },
  {
    id: "patient-2",
    displayName: "Priya Sharma",
    reasonForVisit: "Persistent cough, abnormal chest X-ray",
    lastVisitAt: hoursAgo(1.4),
    acuity: "abnormal",
  },
  {
    id: "patient-3",
    displayName: "John Carter",
    reasonForVisit: "Chest pain, elevated troponin",
    lastVisitAt: hoursAgo(2.1),
    acuity: "critical",
  },
  {
    id: "patient-4",
    displayName: "Meera Nair",
    reasonForVisit: "Annual physical",
    lastVisitAt: hoursAgo(4.8),
    acuity: "normal",
  },
  {
    id: "patient-5",
    displayName: "David Okafor",
    reasonForVisit: "Post-op wound check",
    lastVisitAt: hoursAgo(6.3),
    acuity: "abnormal",
  },
];

export const mockQuickActions: QuickAction[] = [
  {
    id: "new-consultation",
    label: "New Consultation",
    description: "Start an AI-assisted voice consultation",
    icon: "consultation",
    enabled: false,
  },
  {
    id: "search-patient",
    label: "Search Patient",
    description: "Find a patient record",
    icon: "search",
    enabled: false,
  },
  {
    id: "todays-schedule",
    label: "Today's Schedule",
    description: "View the full appointment schedule",
    icon: "schedule",
    enabled: false,
  },
  {
    id: "generate-report",
    label: "Generate Report",
    description: "Export a clinical activity report",
    icon: "report",
    enabled: false,
  },
];
