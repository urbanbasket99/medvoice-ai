import { z } from "zod";

export const PRIORITY_OPTIONS = ["routine", "urgent", "stat"] as const;
export const STATUS_OPTIONS = ["ordered", "scheduled", "in_progress", "completed", "cancelled"] as const;
export const IMAGING_CATEGORY_OPTIONS = [
  "xray",
  "ct",
  "mri",
  "ultrasound",
  "mammography",
  "fluoroscopy",
  "nuclear",
  "other",
] as const;

const optionalText = (maxLength: number) =>
  z.preprocess((value) => (value == null ? "" : value), z.string().trim().max(maxLength));

export const radiologyOrderItemSchema = z.object({
  radiologyTestMasterId: z.string().nullable().optional(),
  testName: z.string().trim().min(1, "Test name is required").max(200),
  category: z.enum(IMAGING_CATEGORY_OPTIONS),
  bodyPart: z.string().trim().min(1, "Body part is required").max(100),
  contrastRequired: z.boolean(),
  instructions: optionalText(2000),
  sortOrder: z.number(),
});

export const radiologyOrderFormSchema = z.object({
  consultationId: z.string().min(1, "Consultation is required"),
  priority: z.enum(PRIORITY_OPTIONS),
  clinicalNotes: optionalText(4000),
  items: z.array(radiologyOrderItemSchema).min(1, "Add at least one radiology test"),
});

export const radiologyOrderStatusUpdateSchema = z.object({
  status: z.enum(STATUS_OPTIONS),
  notes: optionalText(2000),
});

export type RadiologyOrderFormValues = z.infer<typeof radiologyOrderFormSchema>;
export type RadiologyOrderItemFormValues = z.infer<typeof radiologyOrderItemSchema>;
export type RadiologyOrderStatusUpdateFormValues = z.infer<typeof radiologyOrderStatusUpdateSchema>;
