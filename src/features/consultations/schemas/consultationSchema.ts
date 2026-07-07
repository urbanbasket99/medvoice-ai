import { z } from "zod";

export const CONSULTATION_STATUS_OPTIONS = ["draft", "in_progress", "completed", "cancelled"] as const;

const optionalText = (maxLength: number) =>
  z.preprocess(
    (value) => (value == null ? "" : value),
    z.string().trim().max(maxLength)
  );

const optionalNumberField = (min: number, max: number) =>
  z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) return undefined;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : value;
    },
    z.number({ invalid_type_error: "Enter a valid number" }).min(min).max(max).optional()
  );

export const vitalSignsSchema = z.object({
  bloodPressureSystolic: optionalNumberField(40, 300),
  bloodPressureDiastolic: optionalNumberField(20, 200),
  pulse: optionalNumberField(20, 250),
  temperature: optionalNumberField(30, 45),
  spo2: optionalNumberField(50, 100),
  respiratoryRate: optionalNumberField(5, 60),
  weightKg: optionalNumberField(0, 500),
  heightCm: optionalNumberField(0, 300),
});

export const consultationFormSchema = z.object({
  chiefComplaint: optionalText(4000),
  historyOfPresentIllness: optionalText(8000),
  pastMedicalHistory: optionalText(8000),
  familyHistory: optionalText(4000),
  allergies: optionalText(4000),
  currentMedications: optionalText(4000),
  vitalSigns: vitalSignsSchema,
  physicalExamination: optionalText(8000),
  diagnosis: optionalText(4000),
  assessment: optionalText(8000),
  treatmentPlan: optionalText(8000),
  doctorNotes: optionalText(8000),
  followUpDate: z.preprocess((value) => (value == null ? "" : value), z.string()),
  status: z.enum(CONSULTATION_STATUS_OPTIONS),
});

export type ConsultationFormValues = z.infer<typeof consultationFormSchema>;

export const consultationFormDefaultValues: ConsultationFormValues = {
  chiefComplaint: "",
  historyOfPresentIllness: "",
  pastMedicalHistory: "",
  familyHistory: "",
  allergies: "",
  currentMedications: "",
  vitalSigns: {
    bloodPressureSystolic: "",
    bloodPressureDiastolic: "",
    pulse: "",
    temperature: "",
    spo2: "",
    respiratoryRate: "",
    weightKg: "",
    heightCm: "",
  },
  physicalExamination: "",
  diagnosis: "",
  assessment: "",
  treatmentPlan: "",
  doctorNotes: "",
  followUpDate: "",
  status: "in_progress",
};

export const CONSULTATION_STATUS_LABELS: Record<(typeof CONSULTATION_STATUS_OPTIONS)[number], string> = {
  draft: "Draft",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const STATUS_COLORS: Record<
  (typeof CONSULTATION_STATUS_OPTIONS)[number],
  "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"
> = {
  draft: "default",
  in_progress: "warning",
  completed: "success",
  cancelled: "error",
};

export const GENDER_LABELS: Record<string, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
};
