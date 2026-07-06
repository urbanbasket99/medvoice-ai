/**
 * Frontend-facing (camelCase) representation of a patient record.
 * Mirrors the backend's `PatientResponse` schema — see
 * `backend/app/modules/patients/presentation/schemas.py`.
 */

export type Gender = "male" | "female" | "other";

export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | "unknown";

export type MaritalStatus = "single" | "married" | "divorced" | "widowed" | "other";

export type PatientStatus = "active" | "inactive" | "deceased";

export type PatientSortField =
  | "created_at"
  | "first_name"
  | "last_name"
  | "uhid"
  | "mrn"
  | "date_of_birth"
  | "registration_date";

export type SortDirection = "asc" | "desc";

export interface Patient {
  id: string;
  mrn: string;
  uhid: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  fullName: string;
  dateOfBirth: string;
  age: number;
  gender: Gender;
  bloodGroup: BloodGroup | null;
  maritalStatus: MaritalStatus | null;
  occupation: string | null;
  mobile: string;
  alternateMobile: string | null;
  email: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  emergencyName: string | null;
  emergencyRelation: string | null;
  emergencyMobile: string | null;
  insuranceProvider: string | null;
  insuranceNumber: string | null;
  allergies: string | null;
  chronicConditions: string | null;
  notes: string | null;
  registrationDate: string;
  status: PatientStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface PatientListResult {
  items: Patient[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PatientListParams {
  page?: number;
  pageSize?: number;
  sortBy?: PatientSortField;
  sortDir?: SortDirection;
  status?: PatientStatus;
  gender?: Gender;
  bloodGroup?: BloodGroup;
  city?: string;
}

export interface PatientSearchParams {
  query: string;
  page?: number;
  pageSize?: number;
}

export interface PatientMutationPayload {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  bloodGroup?: BloodGroup | null;
  maritalStatus?: MaritalStatus | null;
  occupation?: string | null;
  mobile: string;
  alternateMobile?: string | null;
  email?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  emergencyName?: string | null;
  emergencyRelation?: string | null;
  emergencyMobile?: string | null;
  insuranceProvider?: string | null;
  insuranceNumber?: string | null;
  allergies?: string | null;
  chronicConditions?: string | null;
  notes?: string | null;
  registrationDate?: string | null;
}

export type CreatePatientPayload = PatientMutationPayload;

export interface UpdatePatientPayload extends PatientMutationPayload {
  status: PatientStatus;
}
