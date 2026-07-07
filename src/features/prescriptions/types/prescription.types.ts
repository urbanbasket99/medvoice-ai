export type Frequency = "od" | "bd" | "tds" | "qid" | "hs" | "prn" | "custom";
export type Route = "oral" | "topical" | "iv" | "im" | "sc" | "inhalation" | "other";
export type PrescriptionSortField = "created_at" | "updated_at";
export type SortDirection = "asc" | "desc";

export interface DosageInstruction {
  morning: boolean;
  afternoon: boolean;
  night: boolean;
  beforeFood: boolean;
  afterFood: boolean;
}

export interface PrescriptionItem {
  id: string;
  prescriptionId: string;
  medicineMasterId: string | null;
  medicineName: string;
  strength: string | null;
  dosage: string | null;
  frequency: Frequency;
  route: Route;
  duration: string | null;
  quantity: string | null;
  instructions: string | null;
  sortOrder: number;
  dosageInstruction: DosageInstruction | null;
}

export interface Prescription {
  id: string;
  consultationId: string;
  patientId: string;
  doctorId: string;
  diagnosis: string | null;
  advice: string | null;
  createdAt: string;
  updatedAt: string;
  patientName: string | null;
  patientMrn: string | null;
  patientUhid: string | null;
  patientGender: string | null;
  patientDateOfBirth: string | null;
  doctorName: string | null;
  doctorCode: string | null;
  doctorSpecialization: string | null;
  consultationVisitNumber: string | null;
  items: PrescriptionItem[];
}

export interface PrescriptionListResult {
  items: Prescription[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PrescriptionListParams {
  page?: number;
  pageSize?: number;
  sortBy?: PrescriptionSortField;
  sortDir?: SortDirection;
  consultationId?: string;
  patientId?: string;
  doctorId?: string;
}

export interface PrescriptionSearchParams {
  query: string;
  page?: number;
  pageSize?: number;
}

export interface PrescriptionItemPayload {
  medicineMasterId?: string | null;
  medicineName: string;
  strength?: string | null;
  dosage?: string | null;
  frequency: Frequency;
  route: Route;
  duration?: string | null;
  quantity?: string | null;
  instructions?: string | null;
  sortOrder: number;
  dosageInstruction?: DosageInstruction | null;
}

export interface CreatePrescriptionPayload {
  consultationId: string;
  diagnosis?: string | null;
  advice?: string | null;
  items: PrescriptionItemPayload[];
}

export interface UpdatePrescriptionPayload {
  diagnosis?: string | null;
  advice?: string | null;
  items: PrescriptionItemPayload[];
}

export interface MedicineMaster {
  id: string;
  name: string;
  genericName: string | null;
  strength: string | null;
  form: string | null;
  defaultRoute: Route | null;
  manufacturer: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface MedicineSearchResult {
  items: MedicineMaster[];
}

export interface PrescriptionPrintItem {
  medicineName: string;
  strength: string | null;
  dosage: string | null;
  frequency: string;
  route: string;
  duration: string | null;
  quantity: string | null;
  instructions: string | null;
  dosageSummary: string | null;
}

export interface PrescriptionPrintData {
  prescriptionId: string;
  consultationId: string;
  patientName: string | null;
  patientMrn: string | null;
  patientUhid: string | null;
  patientGender: string | null;
  patientDateOfBirth: string | null;
  doctorName: string | null;
  doctorCode: string | null;
  doctorSpecialization: string | null;
  consultationVisitNumber: string | null;
  diagnosis: string | null;
  advice: string | null;
  items: PrescriptionPrintItem[];
  createdAt: string;
}

export interface PrescriptionPdfExportResult {
  pdfPlaceholder: boolean;
  message: string;
  prescriptionId: string;
}
