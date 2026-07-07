import type {
  RadiologyPriority,
  RadiologyStatus,
  RadiologyOrder,
  ImagingCategory,
  CreateRadiologyOrderPayload,
  RadiologyOrderItemPayload,
  UpdateRadiologyOrderPayload,
  UpdateRadiologyOrderStatusPayload,
} from "../types/radiology.types";
import type { RadiologyOrderFormValues, RadiologyOrderItemFormValues } from "../schemas/radiologySchema";
import { PRIORITY_OPTIONS, IMAGING_CATEGORY_OPTIONS, STATUS_OPTIONS } from "../schemas/radiologySchema";

export const PRIORITY_LABELS: Record<RadiologyPriority, string> = {
  routine: "Routine",
  urgent: "Urgent",
  stat: "STAT",
};

export const STATUS_LABELS: Record<RadiologyStatus, string> = {
  ordered: "Ordered",
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const IMAGING_CATEGORY_LABELS: Record<ImagingCategory, string> = {
  xray: "X-Ray",
  ct: "CT",
  mri: "MRI",
  ultrasound: "Ultrasound",
  mammography: "Mammography",
  fluoroscopy: "Fluoroscopy",
  nuclear: "Nuclear",
  other: "Other",
};

export const defaultRadiologyOrderItem = (sortOrder = 0): RadiologyOrderItemFormValues => ({
  radiologyTestMasterId: null,
  testName: "",
  category: "xray",
  bodyPart: "",
  contrastRequired: false,
  instructions: "",
  sortOrder,
});

export const radiologyOrderFormDefaultValues = (consultationId = ""): RadiologyOrderFormValues => ({
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

const toItemPayload = (item: RadiologyOrderItemFormValues, index: number): RadiologyOrderItemPayload => ({
  radiologyTestMasterId: item.radiologyTestMasterId ?? null,
  testName: item.testName.trim(),
  category: item.category,
  bodyPart: item.bodyPart.trim(),
  contrastRequired: item.contrastRequired,
  instructions: emptyToNull(item.instructions),
  sortOrder: index,
});

export const toCreatePayload = (values: RadiologyOrderFormValues): CreateRadiologyOrderPayload => ({
  consultationId: values.consultationId,
  priority: values.priority,
  clinicalNotes: emptyToNull(values.clinicalNotes),
  items: values.items.map(toItemPayload),
});

export const toUpdatePayload = (values: RadiologyOrderFormValues): UpdateRadiologyOrderPayload => ({
  priority: values.priority,
  clinicalNotes: emptyToNull(values.clinicalNotes),
  items: values.items.map(toItemPayload),
});

export const toStatusUpdatePayload = (
  status: RadiologyStatus,
  notes?: string
): UpdateRadiologyOrderStatusPayload => ({
  status,
  notes: emptyToNull(notes),
});

export const toFormValues = (radiologyOrder: RadiologyOrder): RadiologyOrderFormValues => ({
  consultationId: radiologyOrder.consultationId,
  priority: PRIORITY_OPTIONS.includes(radiologyOrder.priority as RadiologyPriority)
    ? (radiologyOrder.priority as RadiologyPriority)
    : "routine",
  clinicalNotes: radiologyOrder.clinicalNotes ?? "",
  items:
    radiologyOrder.items.length > 0
      ? radiologyOrder.items
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((item) => ({
            radiologyTestMasterId: item.radiologyTestMasterId,
            testName: item.testName,
            category: IMAGING_CATEGORY_OPTIONS.includes(item.category as ImagingCategory)
              ? (item.category as ImagingCategory)
              : "other",
            bodyPart: item.bodyPart,
            contrastRequired: item.contrastRequired,
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
  status: RadiologyStatus
): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
  switch (status) {
    case "ordered":
      return "info";
    case "scheduled":
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
  priority: RadiologyPriority
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

export const isTerminalStatus = (status: RadiologyStatus): boolean =>
  status === "completed" || status === "cancelled";

export const sortStatusHistory = (history: RadiologyOrder["statusHistory"]) =>
  [...history].sort((a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime());

export { STATUS_OPTIONS };

export const inferContrastRequired = (testName: string): boolean => /contrast/i.test(testName);
