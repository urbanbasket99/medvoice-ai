import { z } from "zod";

export const APPOINTMENT_TYPE_OPTIONS = ["new", "follow_up", "emergency", "telemedicine"] as const;
export const APPOINTMENT_PRIORITY_OPTIONS = ["low", "normal", "high", "critical"] as const;
export const APPOINTMENT_STATUS_OPTIONS = [
  "scheduled",
  "confirmed",
  "checked_in",
  "in_consultation",
  "completed",
  "cancelled",
  "no_show",
] as const;

export const DEPARTMENT_OPTIONS = [
  "cardiology",
  "neurology",
  "orthopedics",
  "pediatrics",
  "general_medicine",
  "dermatology",
  "ent",
  "gynecology",
  "psychiatry",
  "radiology",
  "anesthesiology",
  "surgery",
  "ophthalmology",
  "urology",
  "oncology",
  "dentistry",
  "emergency_medicine",
  "other",
] as const;

const optionalText = (maxLength: number) =>
  z.string().trim().max(maxLength).optional().or(z.literal(""));

export const appointmentFormSchema = z.object({
  patientId: z.string().uuid("Select a patient"),
  doctorId: z.string().uuid("Select a doctor"),
  department: z.enum(DEPARTMENT_OPTIONS),
  appointmentDate: z.string().min(1, "Appointment date is required"),
  appointmentTime: z.string().min(1, "Appointment time is required"),
  durationMinutes: z.coerce.number().int().min(5).max(480),
  appointmentType: z.enum(APPOINTMENT_TYPE_OPTIONS),
  priority: z.enum(APPOINTMENT_PRIORITY_OPTIONS),
  chiefComplaint: optionalText(2000),
  notes: optionalText(2000),
  room: optionalText(50),
  status: z.enum(APPOINTMENT_STATUS_OPTIONS).optional(),
});

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

export const appointmentFormDefaultValues: AppointmentFormValues = {
  patientId: "",
  doctorId: "",
  department: "general_medicine",
  appointmentDate: "",
  appointmentTime: "",
  durationMinutes: 30,
  appointmentType: "new",
  priority: "normal",
  chiefComplaint: "",
  notes: "",
  room: "",
  status: "scheduled",
};

export const DEPARTMENT_LABELS: Record<(typeof DEPARTMENT_OPTIONS)[number], string> = {
  cardiology: "Cardiology",
  neurology: "Neurology",
  orthopedics: "Orthopedics",
  pediatrics: "Pediatrics",
  general_medicine: "General Medicine",
  dermatology: "Dermatology",
  ent: "ENT",
  gynecology: "Gynecology",
  psychiatry: "Psychiatry",
  radiology: "Radiology",
  anesthesiology: "Anesthesiology",
  surgery: "Surgery",
  ophthalmology: "Ophthalmology",
  urology: "Urology",
  oncology: "Oncology",
  dentistry: "Dentistry",
  emergency_medicine: "Emergency Medicine",
  other: "Other",
};

export const APPOINTMENT_TYPE_LABELS: Record<(typeof APPOINTMENT_TYPE_OPTIONS)[number], string> = {
  new: "New",
  follow_up: "Follow-up",
  emergency: "Emergency",
  telemedicine: "Telemedicine",
};

export const APPOINTMENT_PRIORITY_LABELS: Record<(typeof APPOINTMENT_PRIORITY_OPTIONS)[number], string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  critical: "Critical",
};

export const APPOINTMENT_STATUS_LABELS: Record<(typeof APPOINTMENT_STATUS_OPTIONS)[number], string> = {
  scheduled: "Scheduled",
  confirmed: "Confirmed",
  checked_in: "Checked In",
  in_consultation: "In Consultation",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
};

export const STATUS_COLORS: Record<
  (typeof APPOINTMENT_STATUS_OPTIONS)[number],
  "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"
> = {
  scheduled: "primary",
  confirmed: "info",
  checked_in: "warning",
  in_consultation: "secondary",
  completed: "success",
  cancelled: "default",
  no_show: "error",
};
