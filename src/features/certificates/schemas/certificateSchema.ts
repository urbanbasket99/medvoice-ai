import { z } from "zod";

export const CERTIFICATE_TYPE_OPTIONS = [
  "fitness",
  "sick_leave",
  "medical_leave",
  "disability",
  "other",
] as const;

const optionalText = (maxLength: number) =>
  z.preprocess((value) => (value == null ? "" : value), z.string().trim().max(maxLength));

export const certificateFormSchema = z.object({
  patientId: z.string().uuid("Select a patient"),
  doctorId: z.string().uuid("Select a doctor"),
  consultationId: z.string().optional().nullable(),
  certificateType: z.enum(CERTIFICATE_TYPE_OPTIONS),
  issueDate: z.string().min(1, "Issue date is required"),
  validFrom: optionalText(20),
  validTo: optionalText(20),
  diagnosis: optionalText(2000),
  remarks: optionalText(2000),
  fitnessStatus: optionalText(40),
  restDays: z.preprocess(
    (value) => (value === "" || value == null ? null : Number(value)),
    z.number().int().min(0).nullable()
  ),
});

export type CertificateFormValues = z.infer<typeof certificateFormSchema>;

export const certificateFormDefaultValues = (): CertificateFormValues => ({
  patientId: "",
  doctorId: "",
  consultationId: "",
  certificateType: "fitness",
  issueDate: new Date().toISOString().slice(0, 10),
  validFrom: "",
  validTo: "",
  diagnosis: "",
  remarks: "",
  fitnessStatus: "",
  restDays: null,
});
