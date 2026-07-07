import type { Frequency, Prescription, Route } from "../types/prescription.types";
import type { CreatePrescriptionPayload, PrescriptionItemPayload, UpdatePrescriptionPayload } from "../types/prescription.types";
import type { PrescriptionFormValues, PrescriptionItemFormValues } from "../schemas/prescriptionSchema";
import { FREQUENCY_OPTIONS, ROUTE_OPTIONS } from "../schemas/prescriptionSchema";

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  od: "Once daily (OD)",
  bd: "Twice daily (BD)",
  tds: "Three times daily (TDS)",
  qid: "Four times daily (QID)",
  hs: "At bedtime (HS)",
  prn: "As needed (PRN)",
  custom: "Custom",
};

export const ROUTE_LABELS: Record<Route, string> = {
  oral: "Oral",
  topical: "Topical",
  iv: "Intravenous (IV)",
  im: "Intramuscular (IM)",
  sc: "Subcutaneous (SC)",
  inhalation: "Inhalation",
  other: "Other",
};

export const defaultDosageInstruction = (): PrescriptionItemFormValues["dosageInstruction"] => ({
  morning: false,
  afternoon: false,
  night: false,
  beforeFood: false,
  afterFood: false,
});

export const defaultPrescriptionItem = (sortOrder = 0): PrescriptionItemFormValues => ({
  medicineMasterId: null,
  medicineName: "",
  strength: "",
  dosage: "",
  frequency: "bd",
  route: "oral",
  duration: "",
  quantity: "",
  instructions: "",
  sortOrder,
  dosageInstruction: defaultDosageInstruction(),
});

export const prescriptionFormDefaultValues = (consultationId = ""): PrescriptionFormValues => ({
  consultationId,
  diagnosis: "",
  advice: "",
  items: [defaultPrescriptionItem(0)],
});

const emptyToNull = (value: string | null | undefined): string | null => {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const toItemPayload = (item: PrescriptionItemFormValues, index: number): PrescriptionItemPayload => {
  const dosage = item.dosageInstruction;
  const hasDosageInstruction =
    dosage.morning || dosage.afternoon || dosage.night || dosage.beforeFood || dosage.afterFood;

  return {
    medicineMasterId: item.medicineMasterId ?? null,
    medicineName: item.medicineName.trim(),
    strength: emptyToNull(item.strength),
    dosage: emptyToNull(item.dosage),
    frequency: item.frequency,
    route: item.route,
    duration: emptyToNull(item.duration),
    quantity: emptyToNull(item.quantity),
    instructions: emptyToNull(item.instructions),
    sortOrder: index,
    dosageInstruction: hasDosageInstruction
      ? {
          morning: dosage.morning,
          afternoon: dosage.afternoon,
          night: dosage.night,
          beforeFood: dosage.beforeFood,
          afterFood: dosage.afterFood,
        }
      : null,
  };
};

export const toCreatePayload = (values: PrescriptionFormValues): CreatePrescriptionPayload => ({
  consultationId: values.consultationId,
  diagnosis: emptyToNull(values.diagnosis),
  advice: emptyToNull(values.advice),
  items: values.items.map(toItemPayload),
});

export const toUpdatePayload = (values: PrescriptionFormValues): UpdatePrescriptionPayload => ({
  diagnosis: emptyToNull(values.diagnosis),
  advice: emptyToNull(values.advice),
  items: values.items.map(toItemPayload),
});

export const toFormValues = (prescription: Prescription): PrescriptionFormValues => ({
  consultationId: prescription.consultationId,
  diagnosis: prescription.diagnosis ?? "",
  advice: prescription.advice ?? "",
  items:
    prescription.items.length > 0
      ? prescription.items
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((item) => ({
            medicineMasterId: item.medicineMasterId,
            medicineName: item.medicineName,
            strength: item.strength ?? "",
            dosage: item.dosage ?? "",
            frequency: FREQUENCY_OPTIONS.includes(item.frequency as Frequency) ? (item.frequency as Frequency) : "custom",
            route: ROUTE_OPTIONS.includes(item.route as Route) ? (item.route as Route) : "other",
            duration: item.duration ?? "",
            quantity: item.quantity ?? "",
            instructions: item.instructions ?? "",
            sortOrder: item.sortOrder,
            dosageInstruction: item.dosageInstruction
              ? {
                  morning: item.dosageInstruction.morning,
                  afternoon: item.dosageInstruction.afternoon,
                  night: item.dosageInstruction.night,
                  beforeFood: item.dosageInstruction.beforeFood,
                  afterFood: item.dosageInstruction.afterFood,
                }
              : defaultDosageInstruction(),
          }))
      : [defaultPrescriptionItem(0)],
});

export const formatDisplayDate = (value: string | null | undefined): string => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};
