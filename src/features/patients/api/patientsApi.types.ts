/**
 * Wire-format (snake_case) types matching the backend's `PatientResponse` /
 * `PatientListResponse` schemas exactly — see
 * `backend/app/modules/patients/presentation/schemas.py`. Never used
 * outside `patientsApi.ts`; every other frontend module consumes the
 * camelCase `Patient` type from `../types/patient.types`.
 */

import type { BloodGroup, Gender, MaritalStatus, PatientStatus } from "../types/patient.types";

export interface PatientApiResponse {
  id: string;
  mrn: string;
  uhid: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  full_name: string;
  date_of_birth: string;
  age: number;
  gender: Gender;
  blood_group: BloodGroup | null;
  marital_status: MaritalStatus | null;
  occupation: string | null;
  mobile: string;
  alternate_mobile: string | null;
  email: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  emergency_name: string | null;
  emergency_relation: string | null;
  emergency_mobile: string | null;
  insurance_provider: string | null;
  insurance_number: string | null;
  allergies: string | null;
  chronic_conditions: string | null;
  notes: string | null;
  registration_date: string;
  status: PatientStatus;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface PatientListApiResponse {
  items: PatientApiResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PatientRequestBody {
  first_name: string;
  middle_name: string | null;
  last_name: string;
  date_of_birth: string;
  gender: Gender;
  blood_group: BloodGroup | null;
  marital_status: MaritalStatus | null;
  occupation: string | null;
  mobile: string;
  alternate_mobile: string | null;
  email: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  emergency_name: string | null;
  emergency_relation: string | null;
  emergency_mobile: string | null;
  insurance_provider: string | null;
  insurance_number: string | null;
  allergies: string | null;
  chronic_conditions: string | null;
  notes: string | null;
  registration_date: string | null;
  status?: PatientStatus;
}
