export interface InvoiceItemApiResponse {
  id: string;
  invoice_id: string;
  service_name: string;
  department: string;
  quantity: number;
  unit_price: string | number;
  discount_amount: string | number;
  tax_amount: string | number;
  total_amount: string | number;
  sort_order: number;
  reference_type: string | null;
  reference_id: string | null;
}

export interface PaymentApiResponse {
  id: string;
  invoice_id: string;
  payment_number: string;
  amount: string | number;
  payment_method: string;
  reference_number: string | null;
  collected_by: string | null;
  payment_date: string;
  notes: string | null;
  created_at: string;
}

export interface InsuranceClaimApiResponse {
  id: string;
  invoice_id: string;
  claim_number: string | null;
  insurer_name: string | null;
  status: string;
  claimed_amount: string | number | null;
  approved_amount: string | number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceApiResponse {
  id: string;
  invoice_number: string;
  consultation_id: string;
  patient_id: string;
  doctor_id: string;
  invoice_date: string;
  status: string;
  subtotal: string | number;
  discount_amount: string | number;
  tax_amount: string | number;
  grand_total: string | number;
  paid_amount: string | number;
  balance: string | number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  patient_name: string | null;
  patient_mrn: string | null;
  patient_uhid: string | null;
  doctor_name: string | null;
  doctor_code: string | null;
  consultation_visit_number: string | null;
  items: InvoiceItemApiResponse[];
  payments: PaymentApiResponse[];
  insurance_claims: InsuranceClaimApiResponse[];
}

export interface InvoiceListApiResponse {
  items: InvoiceApiResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PaymentListApiResponse {
  items: PaymentApiResponse[];
}

export interface InvoiceItemRequestBody {
  service_name: string;
  department: string;
  quantity: number;
  unit_price: string;
  discount_amount?: string;
  tax_amount?: string;
  sort_order: number;
  reference_type?: string | null;
  reference_id?: string | null;
}

export interface InvoiceCreateRequestBody {
  consultation_id: string;
  invoice_date: string;
  notes?: string | null;
  items: InvoiceItemRequestBody[];
  discount_amount?: string;
  tax_amount?: string;
}

export interface InvoiceUpdateRequestBody {
  invoice_date: string;
  notes?: string | null;
  items: InvoiceItemRequestBody[];
  discount_amount?: string;
  tax_amount?: string;
}

export interface PaymentCreateRequestBody {
  invoice_id: string;
  amount: string;
  payment_method: string;
  payment_date: string;
  reference_number?: string | null;
  notes?: string | null;
}

export interface InvoiceItemSuggestionApiResponse {
  service_name: string;
  department: string;
  quantity: number;
  unit_price: string | number;
  reference_type: string | null;
  reference_id: string | null;
}

export interface ConsultationChargesApiResponse {
  items: InvoiceItemSuggestionApiResponse[];
}
