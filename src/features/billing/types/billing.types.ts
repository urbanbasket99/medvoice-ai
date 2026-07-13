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
export type ClaimStatus = "pending" | "submitted" | "approved" | "rejected";
export type CollectionsGroupBy = "doctor" | "date" | "user";

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
  status: ClaimStatus;
  notes: string | null;
  tpaId: string | null;
  submittedAt: string | null;
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
  isProvisional: boolean;
  isTpa: boolean;
  tpaId: string | null;
  tpaName: string | null;
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
  isProvisional?: boolean;
  isTpa?: boolean;
  tpaId?: string | null;
  items: InvoiceItemPayload[];
}

export interface UpdateInvoicePayload {
  invoiceDate: string;
  notes?: string | null;
  discountAmount?: string;
  taxAmount?: string;
  isProvisional?: boolean;
  isTpa?: boolean;
  tpaId?: string | null;
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

export interface Tpa {
  id: string;
  code: string;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TpaListResult {
  items: Tpa[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TpaListParams {
  page?: number;
  pageSize?: number;
  isActive?: boolean;
}

export interface CreateTpaPayload {
  code: string;
  name: string;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  isActive?: boolean;
}

export interface UpdateTpaPayload extends CreateTpaPayload {}

export interface CreateClaimPayload {
  insurerName?: string | null;
  claimNumber?: string | null;
  claimedAmount?: string | null;
  notes?: string | null;
  tpaId?: string | null;
}

export interface UpdateClaimPayload {
  insurerName?: string | null;
  claimNumber?: string | null;
  claimedAmount?: string | null;
  approvedAmount?: string | null;
  status?: ClaimStatus;
  notes?: string | null;
  tpaId?: string | null;
  submittedAt?: string | null;
}

export interface CollectionsReportParams {
  dateFrom: string;
  dateTo: string;
  groupBy: CollectionsGroupBy;
}

export interface CollectionsReportRow {
  groupKey: string;
  groupLabel: string;
  invoiceCount: number;
  totalCollected: string;
  totalBilled: string;
}

export interface CollectionsReportResult {
  dateFrom: string;
  dateTo: string;
  groupBy: CollectionsGroupBy;
  rows: CollectionsReportRow[];
}
