export interface VitalSignsApiResponse {
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  pulse: number | null;
  temperature: number | null;
  spo2: number | null;
  respiratory_rate: number | null;
  weight_kg: number | null;
  height_cm: number | null;
}

export interface ConsultationApiResponse {
  id: string;
  visit_number: string;
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  patient_name: string | null;
  patient_mrn: string | null;
  patient_uhid: string | null;
  patient_gender: string | null;
  patient_date_of_birth: string | null;
  doctor_name: string | null;
  doctor_code: string | null;
  appointment_number: string | null;
  appointment_date: string | null;
  appointment_time: string | null;
  chief_complaint: string | null;
  history_of_present_illness: string | null;
  past_medical_history: string | null;
  family_history: string | null;
  allergies: string | null;
  current_medications: string | null;
  vital_signs: VitalSignsApiResponse | null;
  physical_examination: string | null;
  diagnosis: string | null;
  assessment: string | null;
  treatment_plan: string | null;
  doctor_notes: string | null;
  follow_up_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ConsultationListApiResponse {
  items: ConsultationApiResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ConsultationCreateRequestBody {
  appointment_id: string;
}

export interface ConsultationUpdateRequestBody {
  chief_complaint?: string | null;
  history_of_present_illness?: string | null;
  past_medical_history?: string | null;
  family_history?: string | null;
  allergies?: string | null;
  current_medications?: string | null;
  vital_signs?: VitalSignsApiResponse | null;
  physical_examination?: string | null;
  diagnosis?: string | null;
  assessment?: string | null;
  treatment_plan?: string | null;
  doctor_notes?: string | null;
  follow_up_date?: string | null;
  status: string;
}
