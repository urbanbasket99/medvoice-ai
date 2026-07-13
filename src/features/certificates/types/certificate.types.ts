export type CertificateType =
  | "fitness"
  | "sick_leave"
  | "medical_leave"
  | "disability"
  | "other";

export type CertificateSortField = "created_at" | "issue_date" | "certificate_number";
export type SortDirection = "asc" | "desc";

export interface MedicalCertificate {
  id: string;
  certificateNumber: string;
  patientId: string;
  doctorId: string;
  consultationId: string | null;
  certificateType: CertificateType;
  issueDate: string;
  validFrom: string | null;
  validTo: string | null;
  diagnosis: string | null;
  remarks: string | null;
  fitnessStatus: string | null;
  restDays: number | null;
  issuedBy: string | null;
  createdAt: string;
  updatedAt: string;
  patientName: string | null;
  patientMrn: string | null;
  patientUhid: string | null;
  doctorName: string | null;
  doctorCode: string | null;
}

export interface CertificateListResult {
  items: MedicalCertificate[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CertificateListParams {
  page?: number;
  pageSize?: number;
  sortBy?: CertificateSortField;
  sortDir?: SortDirection;
  patientId?: string;
  doctorId?: string;
  certificateType?: CertificateType;
}

export interface CreateCertificatePayload {
  patientId: string;
  doctorId: string;
  consultationId?: string | null;
  certificateType: CertificateType;
  issueDate: string;
  validFrom?: string | null;
  validTo?: string | null;
  diagnosis?: string | null;
  remarks?: string | null;
  fitnessStatus?: string | null;
  restDays?: number | null;
}

export interface UpdateCertificatePayload extends CreateCertificatePayload {}

export interface CertificatePrintData {
  certificateId: string;
  certificateNumber: string;
  certificateType: string;
  issueDate: string;
  validFrom: string | null;
  validTo: string | null;
  diagnosis: string | null;
  remarks: string | null;
  fitnessStatus: string | null;
  restDays: number | null;
  patientName: string | null;
  patientMrn: string | null;
  patientUhid: string | null;
  patientGender: string | null;
  patientDateOfBirth: string | null;
  doctorName: string | null;
  doctorCode: string | null;
  doctorSpecialization: string | null;
  createdAt: string;
}
