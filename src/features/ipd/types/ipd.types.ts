export type WardType = "general" | "icu" | "private" | "semi_private" | "step_down" | "other";
export type BedStatus = "available" | "occupied" | "maintenance";
export type AdmissionType = "emergency" | "planned" | "transfer";
export type AdmissionStatus = "admitted" | "discharged" | "cancelled";

export interface Ward {
  id: string;
  code: string;
  name: string;
  wardType: WardType;
  floor: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Bed {
  id: string;
  wardId: string;
  bedNumber: string;
  status: BedStatus;
  wardCode: string | null;
  wardName: string | null;
  wardType: string | null;
  wardFloor: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Admission {
  id: string;
  admissionNumber: string;
  patientId: string;
  consultationId: string | null;
  admittingDoctorId: string;
  bedId: string | null;
  admissionDate: string;
  expectedDischargeDate: string | null;
  admissionType: AdmissionType;
  status: AdmissionStatus;
  chiefComplaint: string | null;
  diagnosis: string | null;
  notes: string | null;
  dischargedAt: string | null;
  dischargeSummary: string | null;
  dischargedBy: string | null;
  patientName: string | null;
  patientMrn: string | null;
  doctorName: string | null;
  doctorCode: string | null;
  consultationVisitNumber: string | null;
  bedNumber: string | null;
  wardName: string | null;
  dischargedByName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WardListParams {
  page?: number;
  pageSize?: number;
  wardType?: WardType;
  isActive?: boolean;
  search?: string;
}

export interface BedListParams {
  page?: number;
  pageSize?: number;
  wardId?: string;
  status?: BedStatus;
  search?: string;
}

export interface AdmissionListParams {
  page?: number;
  pageSize?: number;
  status?: AdmissionStatus;
  admissionType?: AdmissionType;
  patientId?: string;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateWardPayload {
  code: string;
  name: string;
  wardType: WardType;
  floor?: string | null;
  isActive?: boolean;
}

export type UpdateWardPayload = CreateWardPayload;

export interface CreateBedPayload {
  wardId: string;
  bedNumber: string;
  status?: BedStatus;
}

export type UpdateBedPayload = CreateBedPayload;

export interface CreateAdmissionPayload {
  patientId: string;
  admittingDoctorId: string;
  admissionDate: string;
  admissionType: AdmissionType;
  consultationId?: string | null;
  bedId?: string | null;
  expectedDischargeDate?: string | null;
  chiefComplaint?: string | null;
  diagnosis?: string | null;
  notes?: string | null;
}

export interface UpdateAdmissionPayload {
  admittingDoctorId: string;
  admissionDate: string;
  admissionType: AdmissionType;
  consultationId?: string | null;
  bedId?: string | null;
  expectedDischargeDate?: string | null;
  chiefComplaint?: string | null;
  diagnosis?: string | null;
  notes?: string | null;
}

export interface DischargeAdmissionPayload {
  dischargeSummary?: string | null;
}

export type NursingNoteType = "vitals" | "medication" | "observation" | "procedure" | "other";
export type OtScheduleStatus = "scheduled" | "completed" | "cancelled";
export type ChargeType = "room" | "nursing" | "ot" | "pharmacy" | "misc";

export interface NursingNote {
  id: string;
  admissionId: string;
  noteType: NursingNoteType;
  content: string;
  recordedAt: string;
  recordedBy: string | null;
  recordedByName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OtSchedule {
  id: string;
  admissionId: string;
  surgeryName: string;
  surgeonId: string;
  surgeonName: string | null;
  surgeonCode: string | null;
  theatre: string | null;
  scheduledAt: string;
  status: OtScheduleStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MlcCase {
  id: string;
  admissionId: string;
  policeStation: string | null;
  firNumber: string | null;
  injuryDetails: string | null;
  incidentDatetime: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdmissionCharge {
  id: string;
  admissionId: string;
  chargeType: ChargeType;
  description: string;
  amount: number;
  chargeDate: string;
  invoiceId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNursingNotePayload {
  noteType: NursingNoteType;
  content: string;
  recordedAt: string;
}

export interface CreateOtSchedulePayload {
  surgeryName: string;
  surgeonId: string;
  theatre?: string | null;
  scheduledAt: string;
  status?: OtScheduleStatus;
  notes?: string | null;
}

export interface UpdateOtSchedulePayload extends CreateOtSchedulePayload {
  status: OtScheduleStatus;
}

export interface UpsertMlcCasePayload {
  policeStation?: string | null;
  firNumber?: string | null;
  injuryDetails?: string | null;
  incidentDatetime?: string | null;
  isActive?: boolean;
}

export interface CreateAdmissionChargePayload {
  chargeType: ChargeType;
  description: string;
  amount: number;
  chargeDate: string;
}

export interface CreateAdmissionFromConsultationPayload {
  consultationId: string;
  bedId?: string | null;
  admissionDate: string;
  expectedDischargeDate?: string | null;
  notes?: string | null;
}

export interface GenerateAdmissionInvoicePayload {
  invoiceDate: string;
  notes?: string | null;
}
