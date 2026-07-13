export interface WardApiResponse {
  id: string;
  code: string;
  name: string;
  ward_type: string;
  floor: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BedApiResponse {
  id: string;
  ward_id: string;
  bed_number: string;
  status: string;
  ward_code?: string | null;
  ward_name?: string | null;
  ward_type?: string | null;
  ward_floor?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdmissionApiResponse {
  id: string;
  admission_number: string;
  patient_id: string;
  consultation_id: string | null;
  admitting_doctor_id: string;
  bed_id: string | null;
  admission_date: string;
  expected_discharge_date: string | null;
  admission_type: string;
  status: string;
  chief_complaint: string | null;
  diagnosis: string | null;
  notes: string | null;
  discharged_at: string | null;
  discharge_summary: string | null;
  discharged_by: string | null;
  patient_name: string | null;
  patient_mrn: string | null;
  doctor_name: string | null;
  doctor_code: string | null;
  consultation_visit_number: string | null;
  bed_number: string | null;
  ward_name: string | null;
  discharged_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface PagedApiResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface WardRequestBody {
  code: string;
  name: string;
  ward_type: string;
  floor?: string | null;
  is_active?: boolean;
}

export interface BedRequestBody {
  ward_id: string;
  bed_number: string;
  status?: string;
}

export interface AdmissionRequestBody {
  patient_id: string;
  admitting_doctor_id: string;
  admission_date: string;
  admission_type: string;
  consultation_id?: string | null;
  bed_id?: string | null;
  expected_discharge_date?: string | null;
  chief_complaint?: string | null;
  diagnosis?: string | null;
  notes?: string | null;
}

export interface AdmissionUpdateRequestBody {
  admitting_doctor_id: string;
  admission_date: string;
  admission_type: string;
  consultation_id?: string | null;
  bed_id?: string | null;
  expected_discharge_date?: string | null;
  chief_complaint?: string | null;
  diagnosis?: string | null;
  notes?: string | null;
}

export interface AdmissionDischargeRequestBody {
  discharge_summary?: string | null;
}

export interface NursingNoteApiResponse {
  id: string;
  admission_id: string;
  note_type: string;
  content: string;
  recorded_at: string;
  recorded_by: string | null;
  recorded_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface OtScheduleApiResponse {
  id: string;
  admission_id: string;
  surgery_name: string;
  surgeon_id: string;
  surgeon_name: string | null;
  surgeon_code: string | null;
  theatre: string | null;
  scheduled_at: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MlcCaseApiResponse {
  id: string;
  admission_id: string;
  police_station: string | null;
  fir_number: string | null;
  injury_details: string | null;
  incident_datetime: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdmissionChargeApiResponse {
  id: string;
  admission_id: string;
  charge_type: string;
  description: string;
  amount: number;
  charge_date: string;
  invoice_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdmissionFromConsultationRequestBody {
  consultation_id: string;
  bed_id?: string | null;
  admission_date: string;
  expected_discharge_date?: string | null;
  notes?: string | null;
}
