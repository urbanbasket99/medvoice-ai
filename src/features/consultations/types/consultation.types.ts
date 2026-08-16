export type ConsultationStatus = "draft" | "in_progress" | "completed" | "cancelled";

export type ConsultationSortField = "created_at" | "visit_number" | "status" | "follow_up_date";
export type SortDirection = "asc" | "desc";

export interface VitalSigns {
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  pulse?: number;
  temperature?: number;
  spo2?: number;
  respiratoryRate?: number;
  weightKg?: number;
  heightCm?: number;
}

export interface Consultation {
  id: string;
  visitNumber: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  patientName: string | null;
  patientMrn: string | null;
  patientUhid: string | null;
  patientGender: string | null;
  patientDateOfBirth: string | null;
  doctorName: string | null;
  doctorCode: string | null;
  appointmentNumber: string | null;
  appointmentDate: string | null;
  appointmentTime: string | null;
  chiefComplaint: string | null;
  historyOfPresentIllness: string | null;
  pastMedicalHistory: string | null;
  familyHistory: string | null;
  allergies: string | null;
  currentMedications: string | null;
  vitalSigns: VitalSigns | null;
  physicalExamination: string | null;
  diagnosis: string | null;
  assessment: string | null;
  treatmentPlan: string | null;
  doctorNotes: string | null;
  followUpDate: string | null;
  status: ConsultationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ConsultationListResult {
  items: Consultation[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ConsultationListParams {
  page?: number;
  pageSize?: number;
  sortBy?: ConsultationSortField;
  sortDir?: SortDirection;
  status?: ConsultationStatus;
  patientId?: string;
  doctorId?: string;
  appointmentId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ConsultationSearchParams {
  query: string;
  page?: number;
  pageSize?: number;
}

export interface CreateConsultationPayload {
  appointmentId: string;
}

export interface UpdateConsultationPayload {
  chiefComplaint?: string | null;
  historyOfPresentIllness?: string | null;
  pastMedicalHistory?: string | null;
  familyHistory?: string | null;
  allergies?: string | null;
  currentMedications?: string | null;
  vitalSigns?: VitalSigns | null;
  physicalExamination?: string | null;
  diagnosis?: string | null;
  assessment?: string | null;
  treatmentPlan?: string | null;
  doctorNotes?: string | null;
  followUpDate?: string | null;
  status: ConsultationStatus;
}
