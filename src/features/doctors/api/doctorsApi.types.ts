/**
 * Wire-format (snake_case) types matching the backend's `DoctorResponse` /
 * `DoctorListResponse` schemas exactly — see
 * `backend/app/modules/doctors/presentation/schemas.py`.
 */

import type { Department, DoctorStatus, Gender } from "../types/doctor.types";

export interface DoctorApiResponse {
  id: string;
  doctor_code: string;
  full_name: string;
  age: number;
  gender: Gender;
  date_of_birth: string;
  department: Department;
  specialization: string;
  qualification: string;
  registration_number: string;
  experience_years: number;
  mobile: string;
  email: string | null;
  address: string | null;
  languages_spoken: string[];
  consultation_fee: string | number | null;
  working_hours: string | null;
  photo_url: string | null;
  joining_date: string;
  status: DoctorStatus;
  created_at: string;
  updated_at: string;
}

export interface DoctorListApiResponse {
  items: DoctorApiResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface DoctorRequestBody {
  full_name: string;
  gender: Gender;
  date_of_birth: string;
  department: Department;
  specialization: string;
  qualification: string;
  registration_number: string;
  experience_years: number;
  mobile: string;
  email: string | null;
  address: string | null;
  languages_spoken: string[];
  consultation_fee: number | null;
  working_hours: string | null;
  photo_url: string | null;
  joining_date: string | null;
  status?: DoctorStatus;
}
