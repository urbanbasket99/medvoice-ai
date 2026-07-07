import type {
  BillingDepartment,
  CreateInvoicePayload,
  CreatePaymentPayload,
  Invoice,
  InvoiceItemPayload,
  InvoiceStatus,
  PaymentMethod,
  ReferenceType,
  UpdateInvoicePayload,
} from "../types/billing.types";
import type { InvoiceFormValues, InvoiceItemFormValues, PaymentFormValues } from "../schemas/billingSchema";
import { BILLING_DEPARTMENT_OPTIONS, INVOICE_STATUS_OPTIONS, PAYMENT_METHOD_OPTIONS } from "../schemas/billingSchema";

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Draft",
  issued: "Issued",
  partially_paid: "Partially Paid",
  paid: "Paid",
  cancelled: "Cancelled",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  card: "Card",
  upi: "UPI",
  bank_transfer: "Bank Transfer",
  cheque: "Cheque",
  other: "Other",
};

export const BILLING_DEPARTMENT_LABELS: Record<BillingDepartment, string> = {
  consultation: "Consultation",
  laboratory: "Laboratory",
  radiology: "Radiology",
  pharmacy: "Pharmacy",
  prescription: "Prescription",
  other: "Other",
};

export const getStatusChipColor = (
  status: InvoiceStatus
): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
  switch (status) {
    case "draft":
      return "default";
    case "issued":
      return "info";
    case "partially_paid":
      return "warning";
    case "paid":
      return "success";
    case "cancelled":
      return "error";
    default:
      return "default";
  }
};

export const isTerminalStatus = (status: InvoiceStatus): boolean =>
  status === "paid" || status === "cancelled";

export const formatCurrency = (value: string | number | null | undefined): string => {
  if (value == null) return "—";
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return String(value);
  return numeric.toLocaleString("en-IN", { style: "currency", currency: "INR" });
};

export const formatDisplayDate = (value: string | null | undefined): string => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

export const formatDisplayDateTime = (value: string | null | undefined): string => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const emptyToNull = (value: string | null | undefined): string | null => {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const toItemPayload = (item: InvoiceItemFormValues, index: number): InvoiceItemPayload => ({
  serviceName: item.serviceName.trim(),
  department: item.department,
  quantity: item.quantity,
  unitPrice: item.unitPrice,
  discountAmount: item.discountAmount ?? "0",
  taxAmount: item.taxAmount ?? "0",
  sortOrder: index,
  referenceType: (item.referenceType as ReferenceType | null | undefined) ?? null,
  referenceId: item.referenceId ?? null,
});

export const toCreatePayload = (values: InvoiceFormValues): CreateInvoicePayload => ({
  consultationId: values.consultationId,
  invoiceDate: values.invoiceDate,
  notes: emptyToNull(values.notes),
  discountAmount: values.discountAmount ?? "0",
  taxAmount: values.taxAmount ?? "0",
  items: values.items.map(toItemPayload),
});

export const toUpdatePayload = (values: InvoiceFormValues): UpdateInvoicePayload => ({
  invoiceDate: values.invoiceDate,
  notes: emptyToNull(values.notes),
  discountAmount: values.discountAmount ?? "0",
  taxAmount: values.taxAmount ?? "0",
  items: values.items.map(toItemPayload),
});

export const toPaymentPayload = (values: PaymentFormValues, invoiceId: string): CreatePaymentPayload => ({
  invoiceId,
  paymentDate: values.paymentDate,
  amount: values.amount,
  paymentMethod: values.paymentMethod,
  referenceNumber: emptyToNull(values.referenceNumber),
  notes: emptyToNull(values.notes),
});

export const toFormValues = (invoice: Invoice): InvoiceFormValues => ({
  consultationId: invoice.consultationId,
  invoiceDate: invoice.invoiceDate.slice(0, 10),
  notes: invoice.notes ?? "",
  discountAmount: invoice.discountAmount,
  taxAmount: invoice.taxAmount,
  items:
    invoice.items.length > 0
      ? invoice.items
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((item) => ({
            serviceName: item.serviceName,
            department: BILLING_DEPARTMENT_OPTIONS.includes(item.department as BillingDepartment)
              ? (item.department as BillingDepartment)
              : "other",
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountAmount: item.discountAmount,
            taxAmount: item.taxAmount,
            sortOrder: item.sortOrder,
            referenceType: item.referenceType,
            referenceId: item.referenceId,
          }))
      : [],
});

export const defaultInvoiceItem = (sortOrder = 0): InvoiceItemFormValues => ({
  serviceName: "",
  department: "consultation",
  quantity: 1,
  unitPrice: "0",
  discountAmount: "0",
  taxAmount: "0",
  sortOrder,
  referenceType: null,
  referenceId: null,
});

export const invoiceFormDefaultValues = (consultationId = ""): InvoiceFormValues => ({
  consultationId,
  invoiceDate: new Date().toISOString().slice(0, 10),
  notes: "",
  discountAmount: "0",
  taxAmount: "0",
  items: [],
});

export const computeLineTotal = (
  unitPrice: string,
  quantity: number,
  discountAmount: string,
  taxAmount: string
): number => {
  const price = Number(unitPrice) || 0;
  const qty = Number(quantity) || 0;
  const discount = Number(discountAmount) || 0;
  const tax = Number(taxAmount) || 0;
  return price * qty - discount + tax;
};

export const computeTotalsFromItems = (
  items: InvoiceItemFormValues[],
  invoiceDiscount = "0",
  invoiceTax = "0"
): { subtotal: number; discountTotal: number; taxTotal: number; grandTotal: number } => {
  let subtotal = 0;
  let itemDiscountTotal = 0;
  let itemTaxTotal = 0;

  for (const item of items) {
    const price = Number(item.unitPrice) || 0;
    const qty = Number(item.quantity) || 0;
    const discount = Number(item.discountAmount) || 0;
    const tax = Number(item.taxAmount) || 0;
    subtotal += price * qty;
    itemDiscountTotal += discount;
    itemTaxTotal += tax;
  }

  const discountTotal = itemDiscountTotal + (Number(invoiceDiscount) || 0);
  const taxTotal = itemTaxTotal + (Number(invoiceTax) || 0);
  const grandTotal = subtotal - discountTotal + taxTotal;
  return { subtotal, discountTotal, taxTotal, grandTotal };
};

export { INVOICE_STATUS_OPTIONS, PAYMENT_METHOD_OPTIONS, BILLING_DEPARTMENT_OPTIONS };
