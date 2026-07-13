import type { CreateCertificatePayload, MedicalCertificate } from "../types/certificate.types";
import type { CertificateFormValues } from "../schemas/certificateSchema";
import { CERTIFICATE_TYPE_OPTIONS } from "../schemas/certificateSchema";

export const CERTIFICATE_TYPE_LABELS: Record<(typeof CERTIFICATE_TYPE_OPTIONS)[number], string> = {
  fitness: "Fitness",
  sick_leave: "Sick Leave",
  medical_leave: "Medical Leave",
  disability: "Disability",
  other: "Other",
};

const emptyToNull = (value: string | null | undefined): string | null => {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export const toCreatePayload = (values: CertificateFormValues): CreateCertificatePayload => ({
  patientId: values.patientId,
  doctorId: values.doctorId,
  consultationId: emptyToNull(values.consultationId ?? undefined),
  certificateType: values.certificateType,
  issueDate: values.issueDate,
  validFrom: emptyToNull(values.validFrom),
  validTo: emptyToNull(values.validTo),
  diagnosis: emptyToNull(values.diagnosis),
  remarks: emptyToNull(values.remarks),
  fitnessStatus: emptyToNull(values.fitnessStatus),
  restDays: values.restDays,
});

export const toFormValues = (certificate: MedicalCertificate): CertificateFormValues => ({
  patientId: certificate.patientId,
  doctorId: certificate.doctorId,
  consultationId: certificate.consultationId ?? "",
  certificateType: certificate.certificateType,
  issueDate: certificate.issueDate.slice(0, 10),
  validFrom: certificate.validFrom ?? "",
  validTo: certificate.validTo ?? "",
  diagnosis: certificate.diagnosis ?? "",
  remarks: certificate.remarks ?? "",
  fitnessStatus: certificate.fitnessStatus ?? "",
  restDays: certificate.restDays,
});

export const formatDisplayDate = (value: string | null | undefined): string => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};
