export interface PharmacyMedicineApiResponse {
  id: string;
  medicine_code: string;
  generic_name: string;
  brand_name: string;
  strength: string | null;
  dosage_form: string | null;
  manufacturer: string | null;
  category: string;
  mrp: string | number | null;
  selling_price: string | number | null;
  gst: string | number | null;
  barcode: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PharmacyMedicineListApiResponse {
  items: PharmacyMedicineApiResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PharmacyMedicineSearchApiResponse {
  items: PharmacyMedicineApiResponse[];
}

export interface PharmacyMedicineCreateRequestBody {
  medicine_code: string;
  generic_name: string;
  brand_name: string;
  strength?: string | null;
  dosage_form?: string | null;
  manufacturer?: string | null;
  category: string;
  mrp?: string | number | null;
  selling_price?: string | number | null;
  gst?: string | number | null;
  barcode?: string | null;
  is_active?: boolean;
}

export interface PharmacyMedicineUpdateRequestBody {
  generic_name?: string;
  brand_name?: string;
  strength?: string | null;
  dosage_form?: string | null;
  manufacturer?: string | null;
  category?: string;
  mrp?: string | number | null;
  selling_price?: string | number | null;
  gst?: string | number | null;
  barcode?: string | null;
  is_active?: boolean;
}

export interface PharmacyBatchApiResponse {
  id: string;
  medicine_id: string;
  batch_number: string;
  expiry_date: string;
  quantity: number;
  purchase_price: string | number | null;
  selling_price: string | number | null;
  supplier_id: string | null;
  supplier_name: string | null;
  created_at: string;
}

export interface PharmacyBatchListApiResponse {
  items: PharmacyBatchApiResponse[];
}

export interface PharmacyBatchCreateRequestBody {
  medicine_id: string;
  batch_number: string;
  expiry_date: string;
  quantity: number;
  purchase_price?: string | number | null;
  selling_price?: string | number | null;
  supplier_id?: string | null;
}

export interface PharmacyBatchUpdateRequestBody {
  batch_number?: string;
  expiry_date?: string;
  quantity?: number;
  purchase_price?: string | number | null;
  selling_price?: string | number | null;
  supplier_id?: string | null;
}

export interface MedicineStockApiResponse {
  id: string;
  medicine_id: string;
  medicine_code: string | null;
  generic_name: string | null;
  brand_name: string | null;
  strength: string | null;
  dosage_form: string | null;
  category: string | null;
  current_stock: number;
  reserved_stock: number;
  minimum_stock: number;
  maximum_stock: number | null;
  updated_at: string;
}

export interface StockInventoryListApiResponse {
  items: MedicineStockApiResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface StockAdjustRequestBody {
  medicine_id: string;
  batch_id?: string | null;
  quantity_delta: number;
  notes?: string | null;
}

export interface StockReturnRequestBody {
  medicine_id: string;
  batch_id?: string | null;
  quantity: number;
  notes?: string | null;
}

export interface StockMovementApiResponse {
  id: string;
  medicine_id: string;
  batch_id: string | null;
  movement_type: string;
  quantity_delta: number;
  reference_type: string | null;
  reference_id: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  medicine_name: string | null;
  batch_number: string | null;
}

export interface StockHistoryListApiResponse {
  items: StockMovementApiResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface DispenseItemApiResponse {
  id: string;
  dispense_id: string;
  prescription_item_id: string | null;
  medicine_id: string | null;
  batch_id: string | null;
  medicine_name: string;
  quantity: number;
  unit_price: string | number | null;
  instructions: string | null;
  sort_order: number;
  batch_number: string | null;
  expiry_date: string | null;
}

export interface DispenseStatusEventApiResponse {
  id: string;
  dispense_id: string;
  status: string;
  notes: string | null;
  changed_at: string;
}

export interface DispenseRecordApiResponse {
  id: string;
  prescription_id: string | null;
  consultation_id: string | null;
  patient_id: string;
  doctor_id: string | null;
  dispense_type?: string;
  dispensed_by: string | null;
  status: string;
  notes: string | null;
  dispensed_at: string | null;
  created_at: string;
  updated_at: string;
  order_number: string;
  patient_name: string | null;
  patient_mrn: string | null;
  patient_uhid: string | null;
  patient_gender: string | null;
  patient_date_of_birth: string | null;
  doctor_name: string | null;
  doctor_code: string | null;
  doctor_specialization: string | null;
  consultation_visit_number: string | null;
  items: DispenseItemApiResponse[];
  status_history: DispenseStatusEventApiResponse[];
}

export interface DispenseListApiResponse {
  items: DispenseRecordApiResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface DispenseItemRequestBody {
  prescription_item_id?: string | null;
  medicine_id?: string | null;
  batch_id?: string | null;
  medicine_name: string;
  quantity: number;
  unit_price?: string | number | null;
  instructions?: string | null;
  sort_order: number;
}

export interface DispenseCreateRequestBody {
  prescription_id?: string | null;
  patient_id?: string | null;
  dispense_type?: string;
  notes?: string | null;
  items: DispenseItemRequestBody[];
}

export interface DispenseUpdateRequestBody {
  notes?: string | null;
  items: DispenseItemRequestBody[];
}

export interface DispenseStatusUpdateRequestBody {
  status: string;
  notes?: string | null;
}

export interface DispensePrintItemApiResponse {
  medicine_name: string;
  quantity: number;
  unit_price: string | number | null;
  batch_number: string | null;
  expiry_date: string | null;
  instructions: string | null;
}

export interface DispensePrintApiResponse {
  dispense_id: string;
  order_number: string;
  prescription_id: string | null;
  consultation_id: string | null;
  status: string;
  notes: string | null;
  patient_name: string | null;
  patient_mrn: string | null;
  patient_uhid: string | null;
  patient_gender: string | null;
  patient_date_of_birth: string | null;
  doctor_name: string | null;
  doctor_code: string | null;
  doctor_specialization: string | null;
  consultation_visit_number: string | null;
  items: DispensePrintItemApiResponse[];
  dispensed_at: string | null;
  created_at: string | null;
}

export interface PharmacySupplierApiResponse {
  id: string;
  name: string;
  code?: string | null;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
}

export interface PharmacySupplierListApiResponse {
  items: PharmacySupplierApiResponse[];
}

export interface PharmacySupplierCreateRequestBody {
  name: string;
  code?: string | null;
  contact_person?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  is_active?: boolean;
}

export interface PharmacySupplierUpdateRequestBody {
  name?: string;
  code?: string | null;
  contact_person?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  is_active?: boolean;
}

export interface VendorPaymentApiResponse {
  id: string;
  payment_number: string;
  supplier_id: string;
  supplier_name?: string | null;
  amount: string | number;
  payment_date: string;
  payment_method: string;
  reference_number: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface VendorPaymentListApiResponse {
  items: VendorPaymentApiResponse[];
}

export interface VendorPaymentCreateRequestBody {
  supplier_id: string;
  amount: string | number;
  payment_date: string;
  payment_method: string;
  reference_number?: string | null;
  notes?: string | null;
}
