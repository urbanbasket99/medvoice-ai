import { z } from "zod";

export const MEDICINE_CATEGORY_OPTIONS = [
  "tablet",
  "capsule",
  "syrup",
  "injection",
  "cream",
  "ointment",
  "drops",
  "inhaler",
  "other",
] as const;

export const DISPENSE_STATUS_OPTIONS = ["pending", "in_progress", "dispensed", "cancelled"] as const;

const optionalText = (maxLength: number) =>
  z.preprocess(
    (value) => (value == null ? "" : value),
    z.string().trim().max(maxLength)
  );

const optionalPrice = z.preprocess(
  (value) => (value == null ? "" : value),
  z
    .string()
    .trim()
    .refine((val) => val === "" || !Number.isNaN(Number(val)), "Must be a valid number")
);

export const medicineFormSchema = z.object({
  medicineCode: z.string().trim().min(1, "Medicine code is required").max(50),
  genericName: z.string().trim().min(1, "Generic name is required").max(200),
  brandName: z.string().trim().min(1, "Brand name is required").max(200),
  strength: optionalText(100),
  dosageForm: optionalText(100),
  manufacturer: optionalText(200),
  category: z.enum(MEDICINE_CATEGORY_OPTIONS),
  mrp: optionalPrice,
  sellingPrice: optionalPrice,
  gst: optionalPrice,
  barcode: optionalText(100),
  isActive: z.boolean(),
});

export const batchFormSchema = z.object({
  medicineId: z.string().min(1, "Medicine is required"),
  batchNumber: z.string().trim().min(1, "Batch number is required").max(100),
  expiryDate: z.string().min(1, "Expiry date is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  purchasePrice: optionalPrice,
  sellingPrice: optionalPrice,
  supplierId: z.string().nullable().optional(),
});

export const stockAdjustFormSchema = z.object({
  medicineId: z.string().min(1, "Medicine is required"),
  batchId: z.string().nullable().optional(),
  quantityDelta: z.coerce.number().int().refine((val) => val !== 0, "Adjustment cannot be zero"),
  notes: optionalText(500),
});

export const dispenseItemSchema = z.object({
  prescriptionItemId: z.string().nullable().optional(),
  medicineId: z.string().nullable().optional(),
  batchId: z.string().nullable().optional(),
  medicineName: z.string().trim().min(1, "Medicine name is required").max(200),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  unitPrice: optionalPrice,
  instructions: optionalText(500),
  sortOrder: z.number(),
});

export const dispenseFormSchema = z.object({
  prescriptionId: z.string().min(1, "A linked prescription is required"),
  consultationId: z.string().min(1, "Consultation is required"),
  notes: optionalText(2000),
  items: z.array(dispenseItemSchema).min(1, "Add at least one medicine"),
});

export const dispenseStatusUpdateSchema = z.object({
  status: z.enum(DISPENSE_STATUS_OPTIONS),
  notes: optionalText(2000),
});

export type MedicineFormValues = z.infer<typeof medicineFormSchema>;
export type BatchFormValues = z.infer<typeof batchFormSchema>;
export type StockAdjustFormValues = z.infer<typeof stockAdjustFormSchema>;
export type DispenseFormValues = z.infer<typeof dispenseFormSchema>;
export type DispenseItemFormValues = z.infer<typeof dispenseItemSchema>;
export type DispenseStatusUpdateFormValues = z.infer<typeof dispenseStatusUpdateSchema>;
