import { z } from "zod";

export const PRIORITY_OPTIONS = ["routine", "urgent", "stat"] as const;
export const STATUS_OPTIONS = [
  "ordered",
  "sample_collected",
  "in_progress",
  "completed",
  "cancelled",
] as const;
export const SAMPLE_TYPE_OPTIONS = [
  "blood",
  "urine",
  "stool",
  "swab",
  "sputum",
  "csf",
  "tissue",
  "other",
] as const;

const optionalText = (maxLength: number) =>
  z.preprocess(
    (value) => (value == null ? "" : value),
    z.string().trim().max(maxLength)
  );

export const labOrderItemSchema = z.object({
  labTestMasterId: z.string().nullable().optional(),
  labTestName: z.string().trim().min(1, "Test name is required").max(200),
  category: optionalText(100),
  sampleType: z.enum(SAMPLE_TYPE_OPTIONS),
  instructions: optionalText(2000),
  sortOrder: z.number(),
});

export const labOrderFormSchema = z.object({
  consultationId: z.string().min(1, "Consultation is required"),
  priority: z.enum(PRIORITY_OPTIONS),
  clinicalNotes: optionalText(4000),
  items: z.array(labOrderItemSchema).min(1, "Add at least one lab test"),
});

export const labOrderStatusUpdateSchema = z.object({
  status: z.enum(STATUS_OPTIONS),
  notes: optionalText(2000),
});

export type LabOrderFormValues = z.infer<typeof labOrderFormSchema>;
export type LabOrderItemFormValues = z.infer<typeof labOrderItemSchema>;
export type LabOrderStatusUpdateFormValues = z.infer<typeof labOrderStatusUpdateSchema>;
