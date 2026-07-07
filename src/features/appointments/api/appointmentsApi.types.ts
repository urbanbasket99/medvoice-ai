import type {
  AppointmentPriority,
  AppointmentStatus,
  AppointmentType,
  Department,
} from "../types/appointment.types";

export interface AppointmentApiResponse {
  id: string;
  appointment_number: string;
  patient_id: string;
  doctor_id: string;
  patient_name: string | null;
  patient_uhid: string | null;
  doctor_name: string | null;
  doctor_code: string | null;
  department: Department;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  appointment_type: AppointmentType;
  priority: AppointmentPriority;
  status: AppointmentStatus;
  chief_complaint: string | null;
  notes: string | null;
  room: string | null;
  token_number: number | null;
  created_at: string;
  updated_at: string;
}

export interface AppointmentListApiResponse {
  items: AppointmentApiResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AppointmentRequestBody {
  patient_id: string;
  doctor_id: string;
  department: Department;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  appointment_type: AppointmentType;
  priority: AppointmentPriority;
  chief_complaint: string | null;
  notes: string | null;
  room: string | null;
  status?: AppointmentStatus;
}
