/**
 * Frontend-facing (camelCase) representation of an appointment record.
 */

export type AppointmentType = "new" | "follow_up" | "emergency" | "telemedicine";
export type AppointmentPriority = "low" | "normal" | "high" | "critical";
export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "checked_in"
  | "in_consultation"
  | "completed"
  | "cancelled"
  | "no_show";

export type Department =
  | "cardiology"
  | "neurology"
  | "orthopedics"
  | "pediatrics"
  | "general_medicine"
  | "dermatology"
  | "ent"
  | "gynecology"
  | "psychiatry"
  | "radiology"
  | "anesthesiology"
  | "surgery"
  | "ophthalmology"
  | "urology"
  | "oncology"
  | "dentistry"
  | "emergency_medicine"
  | "other";

export type AppointmentSortField =
  | "created_at"
  | "appointment_date"
  | "appointment_time"
  | "token_number"
  | "status"
  | "priority";

export type SortDirection = "asc" | "desc";
export type CalendarViewMode = "month" | "week" | "day" | "agenda" | "doctor";

export interface Appointment {
  id: string;
  appointmentNumber: string;
  patientId: string;
  doctorId: string;
  patientName: string | null;
  patientUhid: string | null;
  doctorName: string | null;
  doctorCode: string | null;
  department: Department;
  appointmentDate: string;
  appointmentTime: string;
  durationMinutes: number;
  appointmentType: AppointmentType;
  priority: AppointmentPriority;
  status: AppointmentStatus;
  chiefComplaint: string | null;
  notes: string | null;
  room: string | null;
  tokenNumber: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentListResult {
  items: Appointment[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AppointmentListParams {
  page?: number;
  pageSize?: number;
  sortBy?: AppointmentSortField;
  sortDir?: SortDirection;
  status?: AppointmentStatus;
  priority?: AppointmentPriority;
  appointmentType?: AppointmentType;
  department?: Department;
  patientId?: string;
  doctorId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AppointmentSearchParams {
  query: string;
  page?: number;
  pageSize?: number;
}

export interface AppointmentMutationPayload {
  patientId: string;
  doctorId: string;
  department: Department;
  appointmentDate: string;
  appointmentTime: string;
  durationMinutes: number;
  appointmentType: AppointmentType;
  priority: AppointmentPriority;
  chiefComplaint?: string | null;
  notes?: string | null;
  room?: string | null;
}

export type CreateAppointmentPayload = AppointmentMutationPayload;

export interface UpdateAppointmentPayload extends AppointmentMutationPayload {
  status: AppointmentStatus;
}
