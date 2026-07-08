import type { AuditAction } from "../types/audit.types";

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  create: "Create",
  update: "Update",
  delete: "Delete",
  view: "View",
  print: "Print",
  export: "Export",
  login: "Login",
  logout: "Logout",
  payment: "Payment",
  prescription_print: "Prescription Print",
  lab_order: "Lab Order",
  radiology_order: "Radiology Order",
  notification_sent: "Notification Sent",
};

export const MODULE_LABELS: Record<string, string> = {
  auth: "Authentication",
  patients: "Patients",
  doctors: "Doctors",
  appointments: "Appointments",
  consultations: "Consultations",
  prescriptions: "Prescriptions",
  laboratory: "Laboratory",
  radiology: "Radiology",
  pharmacy: "Pharmacy",
  billing: "Billing",
  notifications: "Notifications",
  voice: "Voice",
  transcriptions: "Transcriptions",
  ai: "AI",
  audit: "Audit",
  system: "System",
};

export const getActionChipColor = (
  action: AuditAction,
): "default" | "success" | "error" | "warning" | "info" => {
  switch (action) {
    case "create":
    case "login":
    case "payment":
    case "lab_order":
    case "radiology_order":
      return "success";
    case "delete":
    case "logout":
      return "error";
    case "update":
      return "warning";
    case "print":
    case "export":
    case "prescription_print":
    case "notification_sent":
      return "info";
    default:
      return "default";
  }
};

export const formatAuditTimestamp = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export const formatModuleLabel = (module: string): string =>
  MODULE_LABELS[module] ?? module.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};
