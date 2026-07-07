import { z } from "zod";

export const FREQUENCY_OPTIONS = ["od", "bd", "tds", "qid", "hs", "prn", "custom"] as const;
export const ROUTE_OPTIONS = ["oral", "topical", "iv", "im", "sc", "inhalation", "other"] as const;

const optionalText = (maxLength: number) =>
  z.preprocess(
    (value) => (value == null ? "" : value),
    z.string().trim().max(maxLength)
  );

export const dosageInstructionSchema = z.object({
  morning: z.boolean(),
  afternoon: z.boolean(),
  night: z.boolean(),
  beforeFood: z.boolean(),
  afterFood: z.boolean(),
});

export const prescriptionItemSchema = z.object({
  medicineMasterId: z.string().nullable().optional(),
  medicineName: z.string().trim().min(1, "Medicine name is required").max(200),
  strength: optionalText(50),
  dosage: optionalText(100),
  frequency: z.enum(FREQUENCY_OPTIONS),
  route: z.enum(ROUTE_OPTIONS),
  duration: optionalText(50),
  quantity: optionalText(50),
  instructions: optionalText(2000),
  sortOrder: z.number(),
  dosageInstruction: dosageInstructionSchema,
});

export const prescriptionFormSchema = z.object({
  consultationId: z.string().min(1, "Consultation is required"),
  diagnosis: optionalText(4000),
  advice: optionalText(4000),
  items: z.array(prescriptionItemSchema).min(1, "Add at least one medicine"),
});

export type PrescriptionFormValues = z.infer<typeof prescriptionFormSchema>;
export type PrescriptionItemFormValues = z.infer<typeof prescriptionItemSchema>;
export type DosageInstructionFormValues = z.infer<typeof dosageInstructionSchema>;
