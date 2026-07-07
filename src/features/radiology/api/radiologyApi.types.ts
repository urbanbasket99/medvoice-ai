export interface RadiologyOrderItemApiResponse {
  id: string;
  radiology_order_id: string;
  radiology_test_master_id: string | null;
  test_name: string;
  category: string;
  body_part: string;
  contrast_required: boolean;
  instructions: string | null;
  sort_order: number;
}

export interface RadiologyOrderStatusEventApiResponse {
  id: string;
  radiology_order_id: string;
  status: string;
  notes: string | null;
  changed_at: string;
}

export interface RadiologyOrderApiResponse {
  id: string;
  consultation_id: string;
  patient_id: string;
  doctor_id: string;
  order_number: string;
  priority: string;
  clinical_notes: string | null;
  status: string;
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
  items: RadiologyOrderItemApiResponse[];
  status_history: RadiologyOrderStatusEventApiResponse[];
}

export interface RadiologyOrderListApiResponse {
  items: RadiologyOrderApiResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface RadiologyOrderItemRequestBody {
  radiology_test_master_id?: string | null;
  test_name: string;
  category: string;
  body_part: string;
  contrast_required: boolean;
  instructions?: string | null;
  sort_order: number;
}

export interface RadiologyOrderCreateRequestBody {
  consultation_id: string;
  priority: string;
  clinical_notes?: string | null;
  items: RadiologyOrderItemRequestBody[];
}

export interface RadiologyOrderUpdateRequestBody {
  priority: string;
  clinical_notes?: string | null;
  items: RadiologyOrderItemRequestBody[];
}

export interface RadiologyOrderStatusUpdateRequestBody {
  status: string;
  notes?: string | null;
}

export interface RadiologyTestMasterApiResponse {
  id: string;
  test_code: string;
  test_name: string;
  category: string;
  body_part: string;
  estimated_duration: string | null;
  price: string | number | null;
  is_active: boolean;
  created_at: string;
}

export interface RadiologyTestSearchApiResponse {
  items: RadiologyTestMasterApiResponse[];
}

export interface RadiologyTestListApiResponse {
  items: RadiologyTestMasterApiResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface RadiologyOrderPrintItemApiResponse {
  test_name: string;
  category: string;
  body_part: string;
  contrast_required: boolean;
  instructions: string | null;
}

export interface RadiologyOrderPrintApiResponse {
  radiology_order_id: string;
  order_number: string;
  consultation_id: string;
  priority: string;
  status: string;
  clinical_notes: string | null;
  patient_name: string | null;
  patient_mrn: string | null;
  patient_uhid: string | null;
  patient_gender: string | null;
  patient_date_of_birth: string | null;
  doctor_name: string | null;
  doctor_code: string | null;
  doctor_specialization: string | null;
  consultation_visit_number: string | null;
  items: RadiologyOrderPrintItemApiResponse[];
  created_at: string;
}
