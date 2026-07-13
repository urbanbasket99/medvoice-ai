export interface CertificateApiResponse {
  id: string;
  certificate_number: string;
  patient_id: string;
  doctor_id: string;
  consultation_id: string | null;
  certificate_type: string;
  issue_date: string;
  valid_from: string | null;
  valid_to: string | null;
  diagnosis: string | null;
  remarks: string | null;
  fitness_status: string | null;
  rest_days: number | null;
  issued_by: string | null;
  created_at: string;
  updated_at: string;
  patient_name: string | null;
  patient_mrn: string | null;
  patient_uhid: string | null;
  doctor_name: string | null;
  doctor_code: string | null;
}

export interface CertificateListApiResponse {
  items: CertificateApiResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CertificateRequestBody {
  patient_id: string;
  doctor_id: string;
  consultation_id?: string | null;
  certificate_type: string;
  issue_date: string;
  valid_from?: string | null;
  valid_to?: string | null;
  diagnosis?: string | null;
  remarks?: string | null;
  fitness_status?: string | null;
  rest_days?: number | null;
}

export interface CertificatePrintApiResponse {
  certificate_id: string;
  certificate_number: string;
  certificate_type: string;
  issue_date: string;
  valid_from: string | null;
  valid_to: string | null;
  diagnosis: string | null;
  remarks: string | null;
  fitness_status: string | null;
  rest_days: number | null;
  patient_name: string | null;
  patient_mrn: string | null;
  patient_uhid: string | null;
  patient_gender: string | null;
  patient_date_of_birth: string | null;
  doctor_name: string | null;
  doctor_code: string | null;
  doctor_specialization: string | null;
  created_at: string;
}
