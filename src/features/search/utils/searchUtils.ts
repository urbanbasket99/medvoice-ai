import type { SearchCategory } from "../types/search.types";

export const SEARCH_CATEGORY_LABELS: Record<SearchCategory, string> = {
  patients: "Patients",
  doctors: "Doctors",
  appointments: "Appointments",
  consultations: "Consultations",
  prescriptions: "Prescriptions",
  laboratory_orders: "Laboratory",
  radiology_orders: "Radiology",
  medicines: "Medicines",
  invoices: "Invoices",
  audit_logs: "Audit Logs",
};

export const highlightMatch = (text: string, query: string): string => {
  if (!query.trim()) return text;
  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(new RegExp(`(${escaped})`, "ig"), "<mark>$1</mark>");
};

export const getDisplayText = (result: { title: string; highlight: string | null }, _query: string) =>
  result.highlight ?? result.title;
