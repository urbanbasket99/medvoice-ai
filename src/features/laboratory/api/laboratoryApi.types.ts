export interface LabOrderItemApiResponse {
  id: string;
  lab_order_id: string;
  lab_test_master_id: string | null;
  lab_test_name: string;
  category: string | null;
  sample_type: string;
  instructions: string | null;
  sort_order: number;
}

export interface LabOrderStatusEventApiResponse {
  id: string;
  lab_order_id: string;
  status: string;
  notes: string | null;
  changed_at: string;
}

export interface LabOrderApiResponse {
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
  items: LabOrderItemApiResponse[];
  status_history: LabOrderStatusEventApiResponse[];
}

export interface LabOrderListApiResponse {
  items: LabOrderApiResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface LabOrderItemRequestBody {
  lab_test_master_id?: string | null;
  lab_test_name: string;
  category?: string | null;
  sample_type: string;
  instructions?: string | null;
  sort_order: number;
}

export interface LabOrderCreateRequestBody {
  consultation_id: string;
  priority: string;
  clinical_notes?: string | null;
  items: LabOrderItemRequestBody[];
}

export interface LabOrderUpdateRequestBody {
  priority: string;
  clinical_notes?: string | null;
  items: LabOrderItemRequestBody[];
}

export interface LabOrderStatusUpdateRequestBody {
  status: string;
  notes?: string | null;
}

export interface LabTestMasterApiResponse {
  id: string;
  test_code: string;
  test_name: string;
  department: string;
  sample_type: string;
  normal_turnaround_time: string | null;
  price: string | number | null;
  is_active: boolean;
  created_at: string;
}

export interface LabTestSearchApiResponse {
  items: LabTestMasterApiResponse[];
}

export interface LabTestListApiResponse {
  items: LabTestMasterApiResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface LabOrderPrintItemApiResponse {
  lab_test_name: string;
  category: string | null;
  sample_type: string;
  instructions: string | null;
}

export interface LabOrderPrintApiResponse {
  lab_order_id: string;
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
  items: LabOrderPrintItemApiResponse[];
  created_at: string;
}
