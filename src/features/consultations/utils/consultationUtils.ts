import type { ConsultationFormValues } from "../schemas/consultationSchema";
import type { Consultation, UpdateConsultationPayload, VitalSigns } from "../types/consultation.types";

const parseOptionalNumber = (value: unknown): number | null => {
  if (value === "" || value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const toFormValues = (consultation: Consultation): ConsultationFormValues => ({
  chiefComplaint: consultation.chiefComplaint ?? "",
  historyOfPresentIllness: consultation.historyOfPresentIllness ?? "",
  pastMedicalHistory: consultation.pastMedicalHistory ?? "",
  familyHistory: consultation.familyHistory ?? "",
  allergies: consultation.allergies ?? "",
  currentMedications: consultation.currentMedications ?? "",
  vitalSigns: {
    bloodPressureSystolic: consultation.vitalSigns?.bloodPressureSystolic ?? "",
    bloodPressureDiastolic: consultation.vitalSigns?.bloodPressureDiastolic ?? "",
    pulse: consultation.vitalSigns?.pulse ?? "",
    temperature: consultation.vitalSigns?.temperature ?? "",
    spo2: consultation.vitalSigns?.spo2 ?? "",
    respiratoryRate: consultation.vitalSigns?.respiratoryRate ?? "",
    weightKg: consultation.vitalSigns?.weightKg ?? "",
    heightCm: consultation.vitalSigns?.heightCm ?? "",
  },
  physicalExamination: consultation.physicalExamination ?? "",
  diagnosis: consultation.diagnosis ?? "",
  assessment: consultation.assessment ?? "",
  treatmentPlan: consultation.treatmentPlan ?? "",
  doctorNotes: consultation.doctorNotes ?? "",
  followUpDate: consultation.followUpDate ?? "",
  status: consultation.status,
});

export const toUpdatePayload = (values: ConsultationFormValues): UpdateConsultationPayload => {
  const vitalSigns: VitalSigns = {
    bloodPressureSystolic: parseOptionalNumber(values.vitalSigns.bloodPressureSystolic),
    bloodPressureDiastolic: parseOptionalNumber(values.vitalSigns.bloodPressureDiastolic),
    pulse: parseOptionalNumber(values.vitalSigns.pulse),
    temperature: parseOptionalNumber(values.vitalSigns.temperature),
    spo2: parseOptionalNumber(values.vitalSigns.spo2),
    respiratoryRate: parseOptionalNumber(values.vitalSigns.respiratoryRate),
    weightKg: parseOptionalNumber(values.vitalSigns.weightKg),
    heightCm: parseOptionalNumber(values.vitalSigns.heightCm),
  };

  const hasVitals = Object.values(vitalSigns).some((value) => value != null);

  return {
    chiefComplaint: values.chiefComplaint || null,
    historyOfPresentIllness: values.historyOfPresentIllness || null,
    pastMedicalHistory: values.pastMedicalHistory || null,
    familyHistory: values.familyHistory || null,
    allergies: values.allergies || null,
    currentMedications: values.currentMedications || null,
    vitalSigns: hasVitals ? vitalSigns : null,
    physicalExamination: values.physicalExamination || null,
    diagnosis: values.diagnosis || null,
    assessment: values.assessment || null,
    treatmentPlan: values.treatmentPlan || null,
    doctorNotes: values.doctorNotes || null,
    followUpDate: values.followUpDate || null,
    status: values.status,
  };
};

export const calculateAge = (dateOfBirth: string | null): number | null => {
  if (!dateOfBirth) return null;
  const dob = new Date(`${dateOfBirth}T00:00:00`);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
};

export const formatDisplayTime = (time: string | null): string => {
  if (!time) return "—";
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
};

export const formatDisplayDate = (isoDate: string | null): string => {
  if (!isoDate) return "—";
  const parsed = new Date(`${isoDate}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? "—" : parsed.toLocaleDateString();
};
