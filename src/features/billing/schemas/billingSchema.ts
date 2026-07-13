import { z } from "zod";

export const INVOICE_STATUS_OPTIONS = [
  "draft",
  "issued",
  "partially_paid",
  "paid",
  "cancelled",
] as const;

export const PAYMENT_METHOD_OPTIONS = [
  "cash",
  "card",
  "upi",
  "bank_transfer",
  "cheque",
  "other",
] as const;

export const BILLING_DEPARTMENT_OPTIONS = [
  "consultation",
  "laboratory",
  "radiology",
  "pharmacy",
  "prescription",
  "other",
] as const;

const optionalText = (maxLength: number) =>
  z.preprocess(
    (value) => (value == null ? "" : value),
    z.string().trim().max(maxLength)
  );

const positiveDecimal = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,4})?$/, "Must be a valid positive number");

const nonNegativeDecimal = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,4})?$/, "Must be a valid non-negative number");

export const invoiceItemSchema = z.object({
  serviceName: z.string().trim().min(1, "Service name is required").max(200),
  department: z.enum(BILLING_DEPARTMENT_OPTIONS),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  unitPrice: nonNegativeDecimal,
  discountAmount: nonNegativeDecimal.optional().default("0"),
  taxAmount: nonNegativeDecimal.optional().default("0"),
  sortOrder: z.number(),
  referenceType: z.string().nullable().optional(),
  referenceId: z.string().nullable().optional(),
});

export const invoiceFormSchema = z.object({
  consultationId: z.string().min(1, "Consultation is required"),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  notes: optionalText(2000),
  discountAmount: nonNegativeDecimal.optional().default("0"),
  taxAmount: nonNegativeDecimal.optional().default("0"),
  isProvisional: z.boolean().default(false),
  isTpa: z.boolean().default(false),
  tpaId: z.string().optional().nullable(),
  items: z.array(invoiceItemSchema).min(1, "Add at least one line item"),
}).superRefine((values, ctx) => {
  if (values.isTpa && !values.tpaId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Select a TPA when TPA billing is enabled",
      path: ["tpaId"],
    });
  }
});

export const paymentFormSchema = z.object({
  paymentDate: z.string().min(1, "Payment date is required"),
  amount: positiveDecimal,
  paymentMethod: z.enum(PAYMENT_METHOD_OPTIONS),
  referenceNumber: optionalText(100),
  notes: optionalText(500),
});

export const CLAIM_STATUS_OPTIONS = ["pending", "submitted", "approved", "rejected"] as const;

export const claimFormSchema = z.object({
  insurerName: optionalText(150),
  claimNumber: optionalText(100),
  claimedAmount: nonNegativeDecimal.optional().or(z.literal("")),
  notes: optionalText(500),
  tpaId: z.string().optional().nullable(),
});

export const tpaFormSchema = z.object({
  code: z.string().trim().min(1, "Code is required").max(30),
  name: z.string().trim().min(1, "Name is required").max(200),
  contactPerson: optionalText(150),
  phone: optionalText(20),
  email: optionalText(255),
  address: optionalText(1000),
  isActive: z.boolean().default(true),
});

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
export type InvoiceItemFormValues = z.infer<typeof invoiceItemSchema>;
export type PaymentFormValues = z.infer<typeof paymentFormSchema>;
export type ClaimFormValues = z.infer<typeof claimFormSchema>;
export type TpaFormValues = z.infer<typeof tpaFormSchema>;
