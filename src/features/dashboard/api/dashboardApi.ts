import { httpClient } from "../../auth/api/httpClient";

import {

  mockAiActivity,

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



const simulateNetworkDelay = (minMs = 250, maxMs = 600): Promise<void> =>

  new Promise((resolve) => setTimeout(resolve, minMs + Math.random() * (maxMs - minMs)));



interface ListCountResponse {

  total: number;

}



const todayIso = (): string => new Date().toISOString().slice(0, 10);



const tomorrowIso = (): string => {

  const date = new Date();

  date.setDate(date.getDate() + 1);

  return date.toISOString().slice(0, 10);

};



const dayKey = (offsetDays: number): string => {

  const date = new Date();

  date.setDate(date.getDate() + offsetDays);

  return date.toISOString().slice(0, 10);

};



const fetchDoctorKpis = async (): Promise<KpiMetric[]> => {

  try {

    const [totalResponse, activeResponse] = await Promise.all([

      httpClient.get<ListCountResponse>("/doctors", { params: { page: 1, page_size: 1 } }),

      httpClient.get<ListCountResponse>("/doctors", {

        params: { page: 1, page_size: 1, status: "active" },

      }),

    ]);



    return [

      {

        id: "active-doctors",

        label: "Active Doctors",

        value: String(activeResponse.data.total),

        icon: "doctors",

        trend: { direction: "flat", changePercent: 0, comparisonLabel: "currently active" },

      },

      {

        id: "total-doctors",

        label: "Total Doctors",

        value: String(totalResponse.data.total),

        icon: "doctors",

        trend: { direction: "flat", changePercent: 0, comparisonLabel: "registered in system" },

      },

    ];

  } catch {

    return [

      {

        id: "active-doctors",

        label: "Active Doctors",

        value: "\u2014",

        icon: "doctors",

        trend: { direction: "flat", changePercent: 0, comparisonLabel: "unavailable" },

      },

      {

        id: "total-doctors",

        label: "Total Doctors",

        value: "\u2014",

        icon: "doctors",

        trend: { direction: "flat", changePercent: 0, comparisonLabel: "unavailable" },

      },

    ];

  }

};



const fetchAppointmentKpis = async (): Promise<KpiMetric[]> => {

  const today = todayIso();

  try {

    const [todayResponse, completedResponse, cancelledResponse, upcomingResponse] = await Promise.all([

      httpClient.get<ListCountResponse>("/appointments", {

        params: { page: 1, page_size: 1, date_from: today, date_to: today },

      }),

      httpClient.get<ListCountResponse>("/appointments", {

        params: { page: 1, page_size: 1, date_from: today, date_to: today, status: "completed" },

      }),

      httpClient.get<ListCountResponse>("/appointments", {

        params: { page: 1, page_size: 1, date_from: today, date_to: today, status: "cancelled" },

      }),

      httpClient.get<ListCountResponse>("/appointments", {

        params: { page: 1, page_size: 1, date_from: tomorrowIso() },

      }),

    ]);



    return [

      {

        id: "appointments-today",

        label: "Today's Appointments",

        value: String(todayResponse.data.total),

        icon: "appointments",

        trend: { direction: "flat", changePercent: 0, comparisonLabel: "scheduled for today" },

      },

      {

        id: "appointments-completed-today",

        label: "Completed Today",

        value: String(completedResponse.data.total),

        icon: "appointments",

        trend: { direction: "flat", changePercent: 0, comparisonLabel: "finished today" },

      },

      {

        id: "appointments-cancelled-today",

        label: "Cancelled Today",

        value: String(cancelledResponse.data.total),

        icon: "appointments",

        trend: { direction: "flat", changePercent: 0, comparisonLabel: "cancelled today" },

      },

      {

        id: "appointments-upcoming",

        label: "Upcoming Appointments",

        value: String(upcomingResponse.data.total),

        icon: "appointments",

        trend: { direction: "flat", changePercent: 0, comparisonLabel: "from tomorrow onward" },

      },

    ];

  } catch {

    return [

      {

        id: "appointments-today",

        label: "Today's Appointments",

        value: "\u2014",

        icon: "appointments",

        trend: { direction: "flat", changePercent: 0, comparisonLabel: "unavailable" },

      },

      {

        id: "appointments-completed-today",

        label: "Completed Today",

        value: "\u2014",

        icon: "appointments",

        trend: { direction: "flat", changePercent: 0, comparisonLabel: "unavailable" },

      },

      {

        id: "appointments-cancelled-today",

        label: "Cancelled Today",

        value: "\u2014",

        icon: "appointments",

        trend: { direction: "flat", changePercent: 0, comparisonLabel: "unavailable" },

      },

      {

        id: "appointments-upcoming",

        label: "Upcoming Appointments",

        value: "\u2014",

        icon: "appointments",

        trend: { direction: "flat", changePercent: 0, comparisonLabel: "unavailable" },

      },

    ];

  }

};



const fetchAppointmentOverview = async (): Promise<AppointmentOverview> => {

  const dayOffsets = [-6, -5, -4, -3, -2, -1, 0];



  try {

    const daily = await Promise.all(

      dayOffsets.map(async (offset) => {

        const date = dayKey(offset);

        const label = new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: "short" });

        const [scheduledResponse, completedResponse] = await Promise.all([

          httpClient.get<ListCountResponse>("/appointments", {

            params: { page: 1, page_size: 1, date_from: date, date_to: date },

          }),

          httpClient.get<ListCountResponse>("/appointments", {

            params: { page: 1, page_size: 1, date_from: date, date_to: date, status: "completed" },

          }),

        ]);

        return {

          date,

          label,

          scheduled: scheduledResponse.data.total,

          completed: completedResponse.data.total,

        };

      })

    );



    const [completedTotal, scheduledTotal, cancelledTotal, noShowTotal] = await Promise.all([

      httpClient.get<ListCountResponse>("/appointments", { params: { page: 1, page_size: 1, status: "completed" } }),

      httpClient.get<ListCountResponse>("/appointments", { params: { page: 1, page_size: 1, status: "scheduled" } }),

      httpClient.get<ListCountResponse>("/appointments", { params: { page: 1, page_size: 1, status: "cancelled" } }),

      httpClient.get<ListCountResponse>("/appointments", { params: { page: 1, page_size: 1, status: "no_show" } }),

    ]);



    return {

      daily,

      statusBreakdown: [

        { status: "completed", label: "Completed", count: completedTotal.data.total },

        { status: "scheduled", label: "Scheduled", count: scheduledTotal.data.total },

        { status: "cancelled", label: "Cancelled", count: cancelledTotal.data.total },

        { status: "noShow", label: "No-show", count: noShowTotal.data.total },

      ],

    };

  } catch {

    return {

      daily: dayOffsets.map((offset) => {

        const date = dayKey(offset);

        const label = new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: "short" });

        return { date, label, scheduled: 0, completed: 0 };

      }),

      statusBreakdown: [

        { status: "completed", label: "Completed", count: 0 },

        { status: "scheduled", label: "Scheduled", count: 0 },

        { status: "cancelled", label: "Cancelled", count: 0 },

        { status: "noShow", label: "No-show", count: 0 },

      ],

    };

  }

};



const fetchConsultationKpis = async (): Promise<KpiMetric[]> => {
  const today = todayIso();
  try {
    const [todayResponse, completedTodayResponse, completedTotalResponse] = await Promise.all([
      httpClient.get<ListCountResponse>("/consultations", {
        params: { page: 1, page_size: 1, date_from: today, date_to: today },
      }),
      httpClient.get<ListCountResponse>("/consultations", {
        params: { page: 1, page_size: 1, date_from: today, date_to: today, status: "completed" },
      }),
      httpClient.get<ListCountResponse>("/consultations", {
        params: { page: 1, page_size: 1, status: "completed" },
      }),
    ]);

    return [
      {
        id: "consultations-today",
        label: "Today's Consultations",
        value: String(todayResponse.data.total),
        icon: "consultations",
        trend: { direction: "flat", changePercent: 0, comparisonLabel: "started today" },
      },
      {
        id: "consultations-completed-today",
        label: "Completed Today",
        value: String(completedTodayResponse.data.total),
        icon: "consultations",
        trend: { direction: "flat", changePercent: 0, comparisonLabel: "completed today" },
      },
      {
        id: "consultations-completed",
        label: "Completed Consultations",
        value: String(completedTotalResponse.data.total),
        icon: "consultations",
        trend: { direction: "flat", changePercent: 0, comparisonLabel: "all time" },
      },
    ];
  } catch {
    return [
      {
        id: "consultations-today",
        label: "Today's Consultations",
        value: "\u2014",
        icon: "consultations",
        trend: { direction: "flat", changePercent: 0, comparisonLabel: "unavailable" },
      },
      {
        id: "consultations-completed-today",
        label: "Completed Today",
        value: "\u2014",
        icon: "consultations",
        trend: { direction: "flat", changePercent: 0, comparisonLabel: "unavailable" },
      },
      {
        id: "consultations-completed",
        label: "Completed Consultations",
        value: "\u2014",
        icon: "consultations",
        trend: { direction: "flat", changePercent: 0, comparisonLabel: "unavailable" },
      },
    ];
  }
};



export const dashboardApi = {

  async getKpis(): Promise<KpiMetric[]> {

    await simulateNetworkDelay();

    const [doctorKpis, appointmentKpis, consultationKpis, mockOperationalKpis] = await Promise.all([

      fetchDoctorKpis(),

      fetchAppointmentKpis(),

      fetchConsultationKpis(),

      Promise.resolve(mockKpis.filter((metric) => !metric.id.includes("doctor") && !metric.id.includes("appointment"))),

    ]);

    return [...doctorKpis, ...appointmentKpis, ...consultationKpis, ...mockOperationalKpis.slice(0, 1)];

  },



  async getAppointmentOverview(): Promise<AppointmentOverview> {

    await simulateNetworkDelay();

    return fetchAppointmentOverview();

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


