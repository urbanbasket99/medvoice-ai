export type MedicineCategory =
  | "tablet"
  | "capsule"
  | "syrup"
  | "injection"
  | "cream"
  | "ointment"
  | "drops"
  | "inhaler"
  | "other";

export type DispenseStatus = "pending" | "in_progress" | "dispensed" | "cancelled";
export type StockMovementType = "purchase" | "dispense" | "adjustment" | "return";
export type MedicineSortField = "created_at" | "updated_at" | "medicine_code" | "brand_name";
export type DispenseSortField = "created_at" | "updated_at" | "order_number";
export type SortDirection = "asc" | "desc";

export interface PharmacyMedicine {
  id: string;
  medicineCode: string;
  genericName: string;
  brandName: string;
  strength: string | null;
  dosageForm: string | null;
  manufacturer: string | null;
  category: MedicineCategory;
  mrp: string | null;
  sellingPrice: string | null;
  gst: string | null;
  barcode: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PharmacyMedicineListResult {
  items: PharmacyMedicine[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PharmacyMedicineListParams {
  page?: number;
  pageSize?: number;
  sortBy?: MedicineSortField;
  sortDir?: SortDirection;
}

export interface PharmacyMedicineSearchParams {
  query: string;
  limit?: number;
}

export interface PharmacyMedicineSearchResult {
  items: PharmacyMedicine[];
}

export interface CreateMedicinePayload {
  medicineCode: string;
  genericName: string;
  brandName: string;
  strength?: string | null;
  dosageForm?: string | null;
  manufacturer?: string | null;
  category: MedicineCategory;
  mrp?: string | null;
  sellingPrice?: string | null;
  gst?: string | null;
  barcode?: string | null;
  isActive?: boolean;
}

export interface UpdateMedicinePayload {
  genericName?: string;
  brandName?: string;
  strength?: string | null;
  dosageForm?: string | null;
  manufacturer?: string | null;
  category?: MedicineCategory;
  mrp?: string | null;
  sellingPrice?: string | null;
  gst?: string | null;
  barcode?: string | null;
  isActive?: boolean;
}

export interface PharmacyBatch {
  id: string;
  medicineId: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  purchasePrice: string | null;
  sellingPrice: string | null;
  supplierId: string | null;
  supplierName: string | null;
  createdAt: string;
}

export interface PharmacyBatchListParams {
  medicineId?: string;
}

export interface CreateBatchPayload {
  medicineId: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  purchasePrice?: string | null;
  sellingPrice?: string | null;
  supplierId?: string | null;
}

export interface UpdateBatchPayload {
  batchNumber?: string;
  expiryDate?: string;
  quantity?: number;
  purchasePrice?: string | null;
  sellingPrice?: string | null;
  supplierId?: string | null;
}

export interface MedicineStock {
  id: string;
  medicineId: string;
  medicineCode: string | null;
  genericName: string | null;
  brandName: string | null;
  strength: string | null;
  dosageForm: string | null;
  category: MedicineCategory | null;
  currentStock: number;
  reservedStock: number;
  minimumStock: number;
  maximumStock: number | null;
  updatedAt: string;
}

export interface StockInventoryListResult {
  items: MedicineStock[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface StockInventoryListParams {
  page?: number;
  pageSize?: number;
}

export interface StockAdjustPayload {
  medicineId: string;
  batchId?: string | null;
  quantityDelta: number;
  notes?: string | null;
}

export interface StockMovement {
  id: string;
  medicineId: string;
  batchId: string | null;
  movementType: StockMovementType;
  quantityDelta: number;
  referenceType: string | null;
  referenceId: string | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
  medicineName: string | null;
  batchNumber: string | null;
}

export interface StockHistoryListResult {
  items: StockMovement[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface StockHistoryListParams {
  page?: number;
  pageSize?: number;
  medicineId?: string;
}

export interface DispenseItem {
  id: string;
  dispenseId: string;
  prescriptionItemId: string | null;
  medicineId: string | null;
  batchId: string | null;
  medicineName: string;
  quantity: number;
  unitPrice: string | null;
  instructions: string | null;
  sortOrder: number;
  batchNumber: string | null;
  expiryDate: string | null;
}

export interface DispenseStatusEvent {
  id: string;
  dispenseId: string;
  status: DispenseStatus;
  notes: string | null;
  changedAt: string;
}

export interface DispenseRecord {
  id: string;
  prescriptionId: string | null;
  consultationId: string;
  patientId: string;
  doctorId: string;
  dispensedBy: string | null;
  status: DispenseStatus;
  notes: string | null;
  dispensedAt: string | null;
  createdAt: string;
  updatedAt: string;
  orderNumber: string;
  patientName: string | null;
  patientMrn: string | null;
  patientUhid: string | null;
  patientGender: string | null;
  patientDateOfBirth: string | null;
  doctorName: string | null;
  doctorCode: string | null;
  doctorSpecialization: string | null;
  consultationVisitNumber: string | null;
  items: DispenseItem[];
  statusHistory: DispenseStatusEvent[];
}

export interface DispenseListResult {
  items: DispenseRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DispenseListParams {
  page?: number;
  pageSize?: number;
  sortBy?: DispenseSortField;
  sortDir?: SortDirection;
  status?: DispenseStatus;
}

export interface DispenseSearchParams {
  query: string;
  page?: number;
  pageSize?: number;
}

export interface DispenseItemPayload {
  prescriptionItemId?: string | null;
  medicineId?: string | null;
  batchId?: string | null;
  medicineName: string;
  quantity: number;
  unitPrice?: string | null;
  instructions?: string | null;
  sortOrder: number;
}

export interface CreateDispensePayload {
  prescriptionId: string;
  notes?: string | null;
  items: DispenseItemPayload[];
}

export interface UpdateDispensePayload {
  notes?: string | null;
  items: DispenseItemPayload[];
}

export interface UpdateDispenseStatusPayload {
  status: DispenseStatus;
  notes?: string | null;
}

export interface DispensePrintItem {
  medicineName: string;
  quantity: number;
  unitPrice: string | null;
  batchNumber: string | null;
  expiryDate: string | null;
  instructions: string | null;
}

export interface DispensePrintData {
  dispenseId: string;
  orderNumber: string;
  prescriptionId: string | null;
  consultationId: string;
  status: string;
  notes: string | null;
  patientName: string | null;
  patientMrn: string | null;
  patientUhid: string | null;
  patientGender: string | null;
  patientDateOfBirth: string | null;
  doctorName: string | null;
  doctorCode: string | null;
  doctorSpecialization: string | null;
  consultationVisitNumber: string | null;
  items: DispensePrintItem[];
  dispensedAt: string | null;
  createdAt: string | null;
}

export interface PharmacySupplier {
  id: string;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface PharmacySupplierListResult {
  items: PharmacySupplier[];
}
