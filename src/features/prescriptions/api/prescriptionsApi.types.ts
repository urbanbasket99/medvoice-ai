export interface DosageInstructionApiResponse {
  morning: boolean;
  afternoon: boolean;
  night: boolean;
  before_food: boolean;
  after_food: boolean;
}

export interface PrescriptionItemApiResponse {
  id: string;
  prescription_id: string;
  medicine_master_id: string | null;
  medicine_name: string;
  strength: string | null;
  dosage: string | null;
  frequency: string;
  route: string;
  duration: string | null;
  quantity: string | null;
  instructions: string | null;
  sort_order: number;
  dosage_instruction: DosageInstructionApiResponse | null;
}

export interface PrescriptionApiResponse {
  id: string;
  consultation_id: string;
  patient_id: string;
  doctor_id: string;
  diagnosis: string | null;
  advice: string | null;
  created_at: string;
  updated_at: string;
  patient_name: string | null;
  patient_mrn: string | null;
  patient_uhid: string | null;
  patient_gender: string | null;
  patient_date_of_birth: string | null;
  doctor_name: string | null;
  doctor_code: string | null;
  doctor_specialization: string | null;
  consultation_visit_number: string | null;
  items: PrescriptionItemApiResponse[];
}

export interface PrescriptionListApiResponse {
  items: PrescriptionApiResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface DosageInstructionRequestBody {
  morning: boolean;
  afternoon: boolean;
  night: boolean;
  before_food: boolean;
  after_food: boolean;
}

export interface PrescriptionItemRequestBody {
  medicine_master_id?: string | null;
  medicine_name: string;
  strength?: string | null;
  dosage?: string | null;
  frequency: string;
  route: string;
  duration?: string | null;
  quantity?: string | null;
  instructions?: string | null;
  sort_order: number;
  dosage_instruction?: DosageInstructionRequestBody | null;
}

export interface PrescriptionCreateRequestBody {
  consultation_id: string;
  diagnosis?: string | null;
  advice?: string | null;
  items: PrescriptionItemRequestBody[];
}

export interface PrescriptionUpdateRequestBody {
  diagnosis?: string | null;
  advice?: string | null;
  items: PrescriptionItemRequestBody[];
}

export interface MedicineMasterApiResponse {
  id: string;
  name: string;
  generic_name: string | null;
  strength: string | null;
  form: string | null;
  default_route: string | null;
  manufacturer: string | null;
  is_active: boolean;
  created_at: string;
}

export interface MedicineSearchApiResponse {
  items: MedicineMasterApiResponse[];
}

export interface PrescriptionPrintItemApiResponse {
  medicine_name: string;
  strength: string | null;
  dosage: string | null;
  frequency: string;
  route: string;
  duration: string | null;
  quantity: string | null;
  instructions: string | null;
  dosage_summary: string | null;
}

export interface PrescriptionPrintApiResponse {
  prescription_id: string;
  consultation_id: string;
  patient_name: string | null;
  patient_mrn: string | null;
  patient_uhid: string | null;
  patient_gender: string | null;
  patient_date_of_birth: string | null;
  doctor_name: string | null;
  doctor_code: string | null;
  doctor_specialization: string | null;
  consultation_visit_number: string | null;
  diagnosis: string | null;
  advice: string | null;
  items: PrescriptionPrintItemApiResponse[];
  created_at: string;
}

export interface PrescriptionPdfExportApiResponse {
  pdf_placeholder: boolean;
  message: string;
  prescription_id: string;
}
