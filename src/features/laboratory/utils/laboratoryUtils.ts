import type {
  LabPriority,
  LabStatus,
  LabOrder,
  SampleType,
  CreateLabOrderPayload,
  LabOrderItemPayload,
  UpdateLabOrderPayload,
  UpdateLabOrderStatusPayload,
} from "../types/laboratory.types";
import type { LabOrderFormValues, LabOrderItemFormValues } from "../schemas/laboratorySchema";
import { PRIORITY_OPTIONS, SAMPLE_TYPE_OPTIONS, STATUS_OPTIONS } from "../schemas/laboratorySchema";

export const PRIORITY_LABELS: Record<LabPriority, string> = {
  routine: "Routine",
  urgent: "Urgent",
  stat: "STAT",
};

export const STATUS_LABELS: Record<LabStatus, string> = {
  ordered: "Ordered",
  sample_collected: "Sample Collected",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const SAMPLE_TYPE_LABELS: Record<SampleType, string> = {
  blood: "Blood",
  urine: "Urine",
  stool: "Stool",
  swab: "Swab",
  sputum: "Sputum",
  csf: "CSF",
  tissue: "Tissue",
  other: "Other",
};

export const defaultLabOrderItem = (sortOrder = 0): LabOrderItemFormValues => ({
  labTestMasterId: null,
  labTestName: "",
  category: "",
  sampleType: "blood",
  instructions: "",
  sortOrder,
});

export const labOrderFormDefaultValues = (consultationId = ""): LabOrderFormValues => ({
  consultationId,
  priority: "routine",
  clinicalNotes: "",
  items: [],
});

const emptyToNull = (value: string | null | undefined): string | null => {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const toItemPayload = (item: LabOrderItemFormValues, index: number): LabOrderItemPayload => ({
  labTestMasterId: item.labTestMasterId ?? null,
  labTestName: item.labTestName.trim(),
  category: emptyToNull(item.category),
  sampleType: item.sampleType,
  instructions: emptyToNull(item.instructions),
  sortOrder: index,
});

export const toCreatePayload = (values: LabOrderFormValues): CreateLabOrderPayload => ({
  consultationId: values.consultationId,
  priority: values.priority,
  clinicalNotes: emptyToNull(values.clinicalNotes),
  items: values.items.map(toItemPayload),
});

export const toUpdatePayload = (values: LabOrderFormValues): UpdateLabOrderPayload => ({
  priority: values.priority,
  clinicalNotes: emptyToNull(values.clinicalNotes),
  items: values.items.map(toItemPayload),
});

export const toStatusUpdatePayload = (status: LabStatus, notes?: string): UpdateLabOrderStatusPayload => ({
  status,
  notes: emptyToNull(notes),
});

export const toFormValues = (labOrder: LabOrder): LabOrderFormValues => ({
  consultationId: labOrder.consultationId,
  priority: PRIORITY_OPTIONS.includes(labOrder.priority as LabPriority)
    ? (labOrder.priority as LabPriority)
    : "routine",
  clinicalNotes: labOrder.clinicalNotes ?? "",
  items:
    labOrder.items.length > 0
      ? labOrder.items
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((item) => ({
            labTestMasterId: item.labTestMasterId,
            labTestName: item.labTestName,
            category: item.category ?? "",
            sampleType: SAMPLE_TYPE_OPTIONS.includes(item.sampleType as SampleType)
              ? (item.sampleType as SampleType)
              : "other",
            instructions: item.instructions ?? "",
            sortOrder: item.sortOrder,
          }))
      : [],
});

export const formatDisplayDate = (value: string | null | undefined): string => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

export const formatDisplayDateTime = (value: string | null | undefined): string => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatPrice = (value: string | null | undefined): string => {
  if (!value) return "—";
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return value;
  return numeric.toLocaleString(undefined, { style: "currency", currency: "INR" });
};

export const getStatusChipColor = (
  status: LabStatus
): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
  switch (status) {
    case "ordered":
      return "info";
    case "sample_collected":
      return "primary";
    case "in_progress":
      return "warning";
    case "completed":
      return "success";
    case "cancelled":
      return "error";
    default:
      return "default";
  }
};

export const getPriorityChipColor = (
  priority: LabPriority
): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
  switch (priority) {
    case "routine":
      return "default";
    case "urgent":
      return "warning";
    case "stat":
      return "error";
    default:
      return "default";
  }
};

export const isTerminalStatus = (status: LabStatus): boolean =>
  status === "completed" || status === "cancelled";

export const sortStatusHistory = (history: LabOrder["statusHistory"]) =>
  [...history].sort((a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime());

export { STATUS_OPTIONS };
