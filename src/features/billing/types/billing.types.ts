export type InvoiceStatus = "draft" | "issued" | "partially_paid" | "paid" | "cancelled";
export type PaymentMethod = "cash" | "card" | "upi" | "bank_transfer" | "cheque" | "other";
export type BillingDepartment =
  | "consultation"
  | "laboratory"
  | "radiology"
  | "pharmacy"
  | "prescription"
  | "other";
export type ReferenceType = "lab_order" | "radiology_order" | "dispense_record" | "prescription" | "manual";
export type InvoiceSortField = "created_at" | "updated_at" | "invoice_number" | "grand_total" | "invoice_date";
export type SortDirection = "asc" | "desc";

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  serviceName: string;
  department: BillingDepartment;
  quantity: number;
  unitPrice: string;
  discountAmount: string;
  taxAmount: string;
  totalAmount: string;
  sortOrder: number;
  referenceType: ReferenceType | null;
  referenceId: string | null;
}

export interface Payment {
  id: string;
  invoiceId: string;
  paymentNumber: string;
  paymentDate: string;
  amount: string;
  paymentMethod: PaymentMethod;
  referenceNumber: string | null;
  notes: string | null;
  createdAt: string;
  collectedBy: string | null;
}

export interface InsuranceClaim {
  id: string;
  invoiceId: string;
  insurerName: string | null;
  claimNumber: string | null;
  claimedAmount: string | null;
  approvedAmount: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  consultationId: string;
  patientId: string;
  doctorId: string;
  invoiceDate: string;
  status: InvoiceStatus;
  subtotal: string;
  discountAmount: string;
  taxAmount: string;
  grandTotal: string;
  paidAmount: string;
  balance: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  patientName: string | null;
  patientMrn: string | null;
  patientUhid: string | null;
  doctorName: string | null;
  doctorCode: string | null;
  consultationVisitNumber: string | null;
  items: InvoiceItem[];
  payments: Payment[];
  insuranceClaims: InsuranceClaim[];
}

export interface InvoiceListResult {
  items: Invoice[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface InvoiceListParams {
  page?: number;
  pageSize?: number;
  sortBy?: InvoiceSortField;
  sortDir?: SortDirection;
  consultationId?: string;
  patientId?: string;
  status?: InvoiceStatus;
}

export interface InvoiceSearchParams {
  query: string;
  page?: number;
  pageSize?: number;
}

export interface InvoiceItemPayload {
  serviceName: string;
  department: BillingDepartment;
  quantity: number;
  unitPrice: string;
  discountAmount?: string;
  taxAmount?: string;
  sortOrder: number;
  referenceType?: ReferenceType | null;
  referenceId?: string | null;
}

export interface CreateInvoicePayload {
  consultationId: string;
  invoiceDate: string;
  notes?: string | null;
  discountAmount?: string;
  taxAmount?: string;
  items: InvoiceItemPayload[];
}

export interface UpdateInvoicePayload {
  invoiceDate: string;
  notes?: string | null;
  discountAmount?: string;
  taxAmount?: string;
  items: InvoiceItemPayload[];
}

export interface CreatePaymentPayload {
  invoiceId: string;
  paymentDate: string;
  amount: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string | null;
  notes?: string | null;
}

export interface ConsultationChargesResult {
  items: InvoiceItemPayload[];
}
