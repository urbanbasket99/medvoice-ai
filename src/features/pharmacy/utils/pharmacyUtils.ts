import type {
  CreateBatchPayload,
  CreateDispensePayload,
  CreateMedicinePayload,
  DispenseItemPayload,
  DispenseRecord,
  DispenseStatus,
  MedicineCategory,
  PharmacyMedicine,
  StockAdjustPayload,
  UpdateBatchPayload,
  UpdateDispensePayload,
  UpdateDispenseStatusPayload,
  UpdateMedicinePayload,
} from "../types/pharmacy.types";
import type {
  BatchFormValues,
  DispenseFormValues,
  DispenseItemFormValues,
  MedicineFormValues,
  StockAdjustFormValues,
} from "../schemas/pharmacySchema";
import { DISPENSE_STATUS_OPTIONS, MEDICINE_CATEGORY_OPTIONS } from "../schemas/pharmacySchema";
import type { Prescription } from "../../prescriptions/types/prescription.types";

export const CATEGORY_LABELS: Record<MedicineCategory, string> = {
  tablet: "Tablet",
  capsule: "Capsule",
  syrup: "Syrup",
  injection: "Injection",
  cream: "Cream",
  ointment: "Ointment",
  drops: "Drops",
  inhaler: "Inhaler",
  other: "Other",
};

export const STATUS_LABELS: Record<DispenseStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  dispensed: "Dispensed",
  cancelled: "Cancelled",
};

export const MOVEMENT_TYPE_LABELS = {
  purchase: "Purchase",
  dispense: "Dispense",
  adjustment: "Adjustment",
  return: "Return",
} as const;

export const defaultDispenseItem = (sortOrder = 0): DispenseItemFormValues => ({
  prescriptionItemId: null,
  medicineId: null,
  batchId: null,
  medicineName: "",
  quantity: 1,
  unitPrice: "",
  instructions: "",
  sortOrder,
});

export const medicineFormDefaultValues = (): MedicineFormValues => ({
  medicineCode: "",
  genericName: "",
  brandName: "",
  strength: "",
  dosageForm: "",
  manufacturer: "",
  category: "tablet",
  mrp: "",
  sellingPrice: "",
  gst: "",
  barcode: "",
  isActive: true,
});

export const batchFormDefaultValues = (medicineId = ""): BatchFormValues => ({
  medicineId,
  batchNumber: "",
  expiryDate: "",
  quantity: 1,
  purchasePrice: "",
  sellingPrice: "",
  supplierId: null,
});

export const stockAdjustFormDefaultValues = (medicineId = ""): StockAdjustFormValues => ({
  medicineId,
  batchId: null,
  quantityDelta: 0,
  notes: "",
});

export const dispenseFormDefaultValues = (
  consultationId = "",
  prescriptionId = ""
): DispenseFormValues => ({
  prescriptionId,
  consultationId,
  notes: "",
  items: [],
});

const emptyToNull = (value: string | null | undefined): string | null => {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const priceToNull = (value: string | null | undefined): string | null => emptyToNull(value);

export const toCreateMedicinePayload = (values: MedicineFormValues): CreateMedicinePayload => ({
  medicineCode: values.medicineCode.trim(),
  genericName: values.genericName.trim(),
  brandName: values.brandName.trim(),
  strength: emptyToNull(values.strength),
  dosageForm: emptyToNull(values.dosageForm),
  manufacturer: emptyToNull(values.manufacturer),
  category: values.category,
  mrp: priceToNull(values.mrp),
  sellingPrice: priceToNull(values.sellingPrice),
  gst: priceToNull(values.gst),
  barcode: emptyToNull(values.barcode),
  isActive: values.isActive,
});

export const toUpdateMedicinePayload = (values: MedicineFormValues): UpdateMedicinePayload => ({
  genericName: values.genericName.trim(),
  brandName: values.brandName.trim(),
  strength: emptyToNull(values.strength),
  dosageForm: emptyToNull(values.dosageForm),
  manufacturer: emptyToNull(values.manufacturer),
  category: values.category,
  mrp: priceToNull(values.mrp),
  sellingPrice: priceToNull(values.sellingPrice),
  gst: priceToNull(values.gst),
  barcode: emptyToNull(values.barcode),
  isActive: values.isActive,
});

export const toMedicineFormValues = (medicine: PharmacyMedicine): MedicineFormValues => ({
  medicineCode: medicine.medicineCode,
  genericName: medicine.genericName,
  brandName: medicine.brandName,
  strength: medicine.strength ?? "",
  dosageForm: medicine.dosageForm ?? "",
  manufacturer: medicine.manufacturer ?? "",
  category: MEDICINE_CATEGORY_OPTIONS.includes(medicine.category as MedicineCategory)
    ? (medicine.category as MedicineCategory)
    : "other",
  mrp: medicine.mrp ?? "",
  sellingPrice: medicine.sellingPrice ?? "",
  gst: medicine.gst ?? "",
  barcode: medicine.barcode ?? "",
  isActive: medicine.isActive,
});

export const toCreateBatchPayload = (values: BatchFormValues): CreateBatchPayload => ({
  medicineId: values.medicineId,
  batchNumber: values.batchNumber.trim(),
  expiryDate: values.expiryDate,
  quantity: values.quantity,
  purchasePrice: priceToNull(values.purchasePrice),
  sellingPrice: priceToNull(values.sellingPrice),
  supplierId: values.supplierId ?? null,
});

export const toUpdateBatchPayload = (values: BatchFormValues): UpdateBatchPayload => ({
  batchNumber: values.batchNumber.trim(),
  expiryDate: values.expiryDate,
  quantity: values.quantity,
  purchasePrice: priceToNull(values.purchasePrice),
  sellingPrice: priceToNull(values.sellingPrice),
  supplierId: values.supplierId ?? null,
});

export const toStockAdjustPayload = (values: StockAdjustFormValues): StockAdjustPayload => ({
  medicineId: values.medicineId,
  batchId: values.batchId ?? null,
  quantityDelta: values.quantityDelta,
  notes: emptyToNull(values.notes),
});

const toItemPayload = (item: DispenseItemFormValues, index: number): DispenseItemPayload => ({
  prescriptionItemId: item.prescriptionItemId ?? null,
  medicineId: item.medicineId ?? null,
  batchId: item.batchId ?? null,
  medicineName: item.medicineName.trim(),
  quantity: item.quantity,
  unitPrice: priceToNull(item.unitPrice),
  instructions: emptyToNull(item.instructions),
  sortOrder: index,
});

export const toCreateDispensePayload = (values: DispenseFormValues): CreateDispensePayload => ({
  prescriptionId: values.prescriptionId,
  notes: emptyToNull(values.notes),
  items: values.items.map(toItemPayload),
});

export const toUpdateDispensePayload = (values: DispenseFormValues): UpdateDispensePayload => ({
  notes: emptyToNull(values.notes),
  items: values.items.map(toItemPayload),
});

export const toStatusUpdatePayload = (
  status: DispenseStatus,
  notes?: string
): UpdateDispenseStatusPayload => ({
  status,
  notes: emptyToNull(notes),
});

export const toDispenseFormValues = (dispense: DispenseRecord): DispenseFormValues => ({
  prescriptionId: dispense.prescriptionId ?? "",
  consultationId: dispense.consultationId ?? "",
  notes: dispense.notes ?? "",
  items:
    dispense.items.length > 0
      ? dispense.items
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((item) => ({
            prescriptionItemId: item.prescriptionItemId,
            medicineId: item.medicineId,
            batchId: item.batchId,
            medicineName: item.medicineName,
            quantity: item.quantity,
            unitPrice: item.unitPrice ?? "",
            instructions: item.instructions ?? "",
            sortOrder: item.sortOrder,
          }))
      : [],
});

export const toDispenseFormValuesFromPrescription = (prescription: Prescription): DispenseFormValues => ({
  prescriptionId: prescription.id,
  consultationId: prescription.consultationId,
  notes: "",
  items: prescription.items
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item, index) => ({
      prescriptionItemId: item.id,
      medicineId: null,
      batchId: null,
      medicineName: item.medicineName,
      quantity: item.quantity ? Math.max(1, Math.ceil(Number(item.quantity))) || 1 : 1,
      unitPrice: "",
      instructions: item.instructions ?? "",
      sortOrder: index,
    })),
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
  status: DispenseStatus
): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
  switch (status) {
    case "pending":
      return "info";
    case "in_progress":
      return "warning";
    case "dispensed":
      return "success";
    case "cancelled":
      return "error";
    default:
      return "default";
  }
};

export const isTerminalStatus = (status: DispenseStatus): boolean =>
  status === "dispensed" || status === "cancelled";

export const isLowStock = (currentStock: number, minimumStock: number): boolean =>
  currentStock <= minimumStock;

export const isExpiringSoon = (expiryDate: string, daysThreshold = 90): boolean => {
  const expiry = new Date(expiryDate);
  if (Number.isNaN(expiry.getTime())) return false;
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + daysThreshold);
  return expiry <= threshold;
};

export const sortStatusHistory = (history: DispenseRecord["statusHistory"]) =>
  [...history].sort((a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime());

export { DISPENSE_STATUS_OPTIONS };
