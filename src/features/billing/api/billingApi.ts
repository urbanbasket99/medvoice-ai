import { httpClient } from "../../auth/api/httpClient";
import type {
  ConsultationChargesApiResponse,
  InvoiceApiResponse,
  InvoiceCreateRequestBody,
  InvoiceItemApiResponse,
  InvoiceItemRequestBody,
  InvoiceListApiResponse,
  InvoiceUpdateRequestBody,
  PaymentApiResponse,
  PaymentCreateRequestBody,
  PaymentListApiResponse,
  InsuranceClaimApiResponse,
} from "./billingApi.types";
import type {
  BillingDepartment,
  ConsultationChargesResult,
  CreateInvoicePayload,
  CreatePaymentPayload,
  InsuranceClaim,
  Invoice,
  InvoiceItem,
  InvoiceListParams,
  InvoiceListResult,
  InvoiceSearchParams,
  InvoiceStatus,
  Payment,
  PaymentMethod,
  ReferenceType,
  UpdateInvoicePayload,
} from "../types/billing.types";

const toPriceString = (value: string | number | null | undefined): string => {
  if (value == null) return "0";
  return String(value);
};

const toInvoiceItem = (response: InvoiceItemApiResponse): InvoiceItem => ({
  id: response.id,
  invoiceId: response.invoice_id,
  serviceName: response.service_name,
  department: response.department as BillingDepartment,
  quantity: response.quantity,
  unitPrice: toPriceString(response.unit_price),
  discountAmount: toPriceString(response.discount_amount),
  taxAmount: toPriceString(response.tax_amount),
  totalAmount: toPriceString(response.total_amount),
  sortOrder: response.sort_order,
  referenceType: (response.reference_type as ReferenceType | null) ?? null,
  referenceId: response.reference_id,
});

const toPayment = (response: PaymentApiResponse): Payment => ({
  id: response.id,
  invoiceId: response.invoice_id,
  paymentNumber: response.payment_number,
  paymentDate: response.payment_date,
  amount: toPriceString(response.amount),
  paymentMethod: response.payment_method as PaymentMethod,
  referenceNumber: response.reference_number,
  notes: response.notes,
  createdAt: response.created_at,
  collectedBy: response.collected_by,
});

const toInsuranceClaim = (response: InsuranceClaimApiResponse): InsuranceClaim => ({
  id: response.id,
  invoiceId: response.invoice_id,
  insurerName: response.insurer_name,
  claimNumber: response.claim_number,
  claimedAmount: response.claimed_amount != null ? toPriceString(response.claimed_amount) : null,
  approvedAmount: response.approved_amount != null ? toPriceString(response.approved_amount) : null,
  status: response.status,
  notes: response.notes,
  createdAt: response.created_at,
  updatedAt: response.updated_at,
});

const toInvoice = (response: InvoiceApiResponse): Invoice => ({
  id: response.id,
  invoiceNumber: response.invoice_number,
  consultationId: response.consultation_id,
  patientId: response.patient_id,
  doctorId: response.doctor_id,
  invoiceDate: response.invoice_date,
  status: response.status as InvoiceStatus,
  subtotal: toPriceString(response.subtotal),
  discountAmount: toPriceString(response.discount_amount),
  taxAmount: toPriceString(response.tax_amount),
  grandTotal: toPriceString(response.grand_total),
  paidAmount: toPriceString(response.paid_amount),
  balance: toPriceString(response.balance),
  notes: response.notes,
  createdAt: response.created_at,
  updatedAt: response.updated_at,
  patientName: response.patient_name,
  patientMrn: response.patient_mrn,
  patientUhid: response.patient_uhid,
  doctorName: response.doctor_name,
  doctorCode: response.doctor_code,
  consultationVisitNumber: response.consultation_visit_number,
  items: response.items.map(toInvoiceItem),
  payments: response.payments.map(toPayment),
  insuranceClaims: response.insurance_claims.map(toInsuranceClaim),
});

const toListResult = (response: InvoiceListApiResponse): InvoiceListResult => ({
  items: response.items.map(toInvoice),
  total: response.total,
  page: response.page,
  pageSize: response.page_size,
  totalPages: response.total_pages,
});

const emptyToNull = (value: string | null | undefined): string | null => {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const toItemBody = (item: CreateInvoicePayload["items"][number]): InvoiceItemRequestBody => ({
  service_name: item.serviceName,
  department: item.department,
  quantity: item.quantity,
  unit_price: item.unitPrice,
  discount_amount: item.discountAmount ?? "0",
  tax_amount: item.taxAmount ?? "0",
  sort_order: item.sortOrder,
  reference_type: item.referenceType ?? null,
  reference_id: item.referenceId ?? null,
});

export const billingApi = {
  async list(params: InvoiceListParams = {}): Promise<InvoiceListResult> {
    const { data } = await httpClient.get<InvoiceListApiResponse>("/billing/invoices", {
      params: {
        page: params.page,
        page_size: params.pageSize,
        sort_by: params.sortBy,
        sort_dir: params.sortDir,
        consultation_id: params.consultationId,
        patient_id: params.patientId,
        status: params.status,
      },
    });
    return toListResult(data);
  },

  async search(params: InvoiceSearchParams): Promise<InvoiceListResult> {
    const { data } = await httpClient.get<InvoiceListApiResponse>("/billing/invoices/search", {
      params: { q: params.query, page: params.page, page_size: params.pageSize },
    });
    return toListResult(data);
  },

  async listOutstanding(params: { page?: number; pageSize?: number } = {}): Promise<InvoiceListResult> {
    const { data } = await httpClient.get<InvoiceListApiResponse>("/billing/invoices/outstanding", {
      params: { page: params.page, page_size: params.pageSize },
    });
    return toListResult(data);
  },

  async getById(id: string): Promise<Invoice> {
    const { data } = await httpClient.get<InvoiceApiResponse>(`/billing/invoices/${id}`);
    return toInvoice(data);
  },

  async create(payload: CreateInvoicePayload): Promise<Invoice> {
    const body: InvoiceCreateRequestBody = {
      consultation_id: payload.consultationId,
      invoice_date: payload.invoiceDate,
      notes: emptyToNull(payload.notes ?? undefined),
      discount_amount: payload.discountAmount ?? "0",
      tax_amount: payload.taxAmount ?? "0",
      items: payload.items.map(toItemBody),
    };
    const { data } = await httpClient.post<InvoiceApiResponse>("/billing/invoices", body);
    return toInvoice(data);
  },

  async update(id: string, payload: UpdateInvoicePayload): Promise<Invoice> {
    const body: InvoiceUpdateRequestBody = {
      invoice_date: payload.invoiceDate,
      notes: emptyToNull(payload.notes ?? undefined),
      discount_amount: payload.discountAmount ?? "0",
      tax_amount: payload.taxAmount ?? "0",
      items: payload.items.map(toItemBody),
    };
    const { data } = await httpClient.put<InvoiceApiResponse>(`/billing/invoices/${id}`, body);
    return toInvoice(data);
  },

  async issue(id: string): Promise<Invoice> {
    const { data } = await httpClient.patch<InvoiceApiResponse>(`/billing/invoices/${id}/issue`);
    return toInvoice(data);
  },

  async remove(id: string): Promise<void> {
    await httpClient.delete(`/billing/invoices/${id}`);
  },

  async createPayment(payload: CreatePaymentPayload): Promise<Payment> {
    const body: PaymentCreateRequestBody = {
      invoice_id: payload.invoiceId,
      payment_date: payload.paymentDate,
      amount: payload.amount,
      payment_method: payload.paymentMethod,
      reference_number: emptyToNull(payload.referenceNumber ?? undefined),
      notes: emptyToNull(payload.notes ?? undefined),
    };
    const { data } = await httpClient.post<PaymentApiResponse>("/billing/payments", body);
    return toPayment(data);
  },

  async listPayments(invoiceId: string): Promise<Payment[]> {
    const { data } = await httpClient.get<PaymentListApiResponse>("/billing/payments", {
      params: { invoice_id: invoiceId },
    });
    return data.items.map(toPayment);
  },

  async getConsultationCharges(consultationId: string): Promise<ConsultationChargesResult> {
    const { data } = await httpClient.get<ConsultationChargesApiResponse>("/billing/invoices/charges", {
      params: { consultation_id: consultationId },
    });
    return {
      items: data.items.map((item, index) => ({
        serviceName: item.service_name,
        department: item.department as BillingDepartment,
        quantity: item.quantity,
        unitPrice: toPriceString(item.unit_price),
        discountAmount: "0",
        taxAmount: "0",
        sortOrder: index,
        referenceType: (item.reference_type as ReferenceType | null) ?? null,
        referenceId: item.reference_id,
      })),
    };
  },
};
