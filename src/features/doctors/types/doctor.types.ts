/**
 * Frontend-facing (camelCase) representation of a doctor record.
 * Mirrors the backend's `DoctorResponse` schema — see
 * `backend/app/modules/doctors/presentation/schemas.py`.
 */

export type Gender = "male" | "female" | "other";

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

export type DoctorStatus = "active" | "inactive" | "on_leave";

export type DoctorSortField =
  | "created_at"
  | "full_name"
  | "doctor_code"
  | "department"
  | "experience_years"
  | "joining_date";

export type SortDirection = "asc" | "desc";

export interface Doctor {
  id: string;
  doctorCode: string;
  fullName: string;
  age: number;
  gender: Gender;
  dateOfBirth: string;
  department: Department;
  specialization: string;
  qualification: string;
  registrationNumber: string;
  experienceYears: number;
  mobile: string;
  email: string | null;
  address: string | null;
  languagesSpoken: string[];
  consultationFee: number | null;
  workingHours: string | null;
  photoUrl: string | null;
  joiningDate: string;
  status: DoctorStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorListResult {
  items: Doctor[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DoctorListParams {
  page?: number;
  pageSize?: number;
  sortBy?: DoctorSortField;
  sortDir?: SortDirection;
  status?: DoctorStatus;
  department?: Department;
  gender?: Gender;
  specialization?: string;
}

export interface DoctorSearchParams {
  query: string;
  page?: number;
  pageSize?: number;
}

export interface DoctorMutationPayload {
  fullName: string;
  gender: Gender;
  dateOfBirth: string;
  department: Department;
  specialization: string;
  qualification: string;
  registrationNumber: string;
  experienceYears: number;
  mobile: string;
  email?: string | null;
  address?: string | null;
  languagesSpoken?: string[];
  consultationFee?: number | null;
  workingHours?: string | null;
  photoUrl?: string | null;
  joiningDate?: string | null;
}

export type CreateDoctorPayload = DoctorMutationPayload;

export interface UpdateDoctorPayload extends DoctorMutationPayload {
  status: DoctorStatus;
}

export interface DoctorAvailabilitySlot {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotMinutes: number;
  isActive: boolean;
}

export interface DoctorAvailability {
  doctorId: string;
  slots: DoctorAvailabilitySlot[];
}

export interface UpdateDoctorAvailabilityPayload {
  slots: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    slotMinutes: number;
    isActive: boolean;
  }>;
}
