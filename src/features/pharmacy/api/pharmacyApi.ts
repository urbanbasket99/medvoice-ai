import { httpClient } from "../../auth/api/httpClient";
import type {
  DispenseCreateRequestBody,
  DispenseItemRequestBody,
  DispenseListApiResponse,
  DispensePrintApiResponse,
  DispenseRecordApiResponse,
  DispenseStatusUpdateRequestBody,
  DispenseUpdateRequestBody,
  MedicineStockApiResponse,
  PharmacyBatchApiResponse,
  PharmacyBatchCreateRequestBody,
  PharmacyBatchListApiResponse,
  PharmacyBatchUpdateRequestBody,
  PharmacyMedicineApiResponse,
  PharmacyMedicineCreateRequestBody,
  PharmacyMedicineListApiResponse,
  PharmacyMedicineSearchApiResponse,
  PharmacyMedicineUpdateRequestBody,
  PharmacySupplierListApiResponse,
  StockAdjustRequestBody,
  StockHistoryListApiResponse,
  StockInventoryListApiResponse,
  DispenseItemApiResponse,
  DispenseStatusEventApiResponse,
  DispensePrintItemApiResponse,
  StockMovementApiResponse,
  PharmacySupplierApiResponse,
} from "./pharmacyApi.types";
import type {
  CreateBatchPayload,
  CreateDispensePayload,
  CreateMedicinePayload,
  DispenseItem,
  DispenseItemPayload,
  DispenseListParams,
  DispenseListResult,
  DispensePrintData,
  DispensePrintItem,
  DispenseRecord,
  DispenseSearchParams,
  DispenseStatus,
  DispenseStatusEvent,
  MedicineCategory,
  MedicineStock,
  PharmacyBatch,
  PharmacyBatchListParams,
  PharmacyMedicine,
  PharmacyMedicineListParams,
  PharmacyMedicineListResult,
  PharmacyMedicineSearchResult,
  PharmacySupplier,
  PharmacySupplierListResult,
  StockAdjustPayload,
  StockHistoryListParams,
  StockHistoryListResult,
  StockInventoryListParams,
  StockInventoryListResult,
  StockMovement,
  StockMovementType,
  UpdateBatchPayload,
  UpdateDispensePayload,
  UpdateDispenseStatusPayload,
  UpdateMedicinePayload,
} from "../types/pharmacy.types";

const toPriceString = (value: string | number | null | undefined): string | null => {
  if (value == null) return null;
  return String(value);
};

const toMedicine = (response: PharmacyMedicineApiResponse): PharmacyMedicine => ({
  id: response.id,
  medicineCode: response.medicine_code,
  genericName: response.generic_name,
  brandName: response.brand_name,
  strength: response.strength,
  dosageForm: response.dosage_form,
  manufacturer: response.manufacturer,
  category: response.category as MedicineCategory,
  mrp: toPriceString(response.mrp),
  sellingPrice: toPriceString(response.selling_price),
  gst: toPriceString(response.gst),
  barcode: response.barcode,
  isActive: response.is_active,
  createdAt: response.created_at,
  updatedAt: response.updated_at,
});

const toBatch = (response: PharmacyBatchApiResponse): PharmacyBatch => ({
  id: response.id,
  medicineId: response.medicine_id,
  batchNumber: response.batch_number,
  expiryDate: response.expiry_date,
  quantity: response.quantity,
  purchasePrice: toPriceString(response.purchase_price),
  sellingPrice: toPriceString(response.selling_price),
  supplierId: response.supplier_id,
  supplierName: response.supplier_name,
  createdAt: response.created_at,
});

const toStock = (response: MedicineStockApiResponse): MedicineStock => ({
  id: response.id,
  medicineId: response.medicine_id,
  medicineCode: response.medicine_code,
  genericName: response.generic_name,
  brandName: response.brand_name,
  strength: response.strength,
  dosageForm: response.dosage_form,
  category: response.category as MedicineCategory | null,
  currentStock: response.current_stock,
  reservedStock: response.reserved_stock,
  minimumStock: response.minimum_stock,
  maximumStock: response.maximum_stock,
  updatedAt: response.updated_at,
});

const toDispenseItem = (response: DispenseItemApiResponse): DispenseItem => ({
  id: response.id,
  dispenseId: response.dispense_id,
  prescriptionItemId: response.prescription_item_id,
  medicineId: response.medicine_id,
  batchId: response.batch_id,
  medicineName: response.medicine_name,
  quantity: response.quantity,
  unitPrice: toPriceString(response.unit_price),
  instructions: response.instructions,
  sortOrder: response.sort_order,
  batchNumber: response.batch_number,
  expiryDate: response.expiry_date,
});

const toStatusEvent = (response: DispenseStatusEventApiResponse): DispenseStatusEvent => ({
  id: response.id,
  dispenseId: response.dispense_id,
  status: response.status as DispenseStatus,
  notes: response.notes,
  changedAt: response.changed_at,
});

const toDispense = (response: DispenseRecordApiResponse): DispenseRecord => ({
  id: response.id,
  prescriptionId: response.prescription_id,
  consultationId: response.consultation_id,
  patientId: response.patient_id,
  doctorId: response.doctor_id,
  dispensedBy: response.dispensed_by,
  status: response.status as DispenseStatus,
  notes: response.notes,
  dispensedAt: response.dispensed_at,
  createdAt: response.created_at,
  updatedAt: response.updated_at,
  orderNumber: response.order_number,
  patientName: response.patient_name,
  patientMrn: response.patient_mrn,
  patientUhid: response.patient_uhid,
  patientGender: response.patient_gender,
  patientDateOfBirth: response.patient_date_of_birth,
  doctorName: response.doctor_name,
  doctorCode: response.doctor_code,
  doctorSpecialization: response.doctor_specialization,
  consultationVisitNumber: response.consultation_visit_number,
  items: response.items.map(toDispenseItem),
  statusHistory: response.status_history.map(toStatusEvent),
});

const toDispenseListResult = (response: DispenseListApiResponse): DispenseListResult => ({
  items: response.items.map(toDispense),
  total: response.total,
  page: response.page,
  pageSize: response.page_size,
  totalPages: response.total_pages,
});

const toMedicineListResult = (response: PharmacyMedicineListApiResponse): PharmacyMedicineListResult => ({
  items: response.items.map(toMedicine),
  total: response.total,
  page: response.page,
  pageSize: response.page_size,
  totalPages: response.total_pages,
});

const toInventoryListResult = (response: StockInventoryListApiResponse): StockInventoryListResult => ({
  items: response.items.map(toStock),
  total: response.total,
  page: response.page,
  pageSize: response.page_size,
  totalPages: response.total_pages,
});

const toMovement = (response: StockMovementApiResponse): StockMovement => ({
  id: response.id,
  medicineId: response.medicine_id,
  batchId: response.batch_id,
  movementType: response.movement_type as StockMovementType,
  quantityDelta: response.quantity_delta,
  referenceType: response.reference_type,
  referenceId: response.reference_id,
  notes: response.notes,
  createdBy: response.created_by,
  createdAt: response.created_at,
  medicineName: response.medicine_name,
  batchNumber: response.batch_number,
});

const toSupplier = (response: PharmacySupplierApiResponse): PharmacySupplier => ({
  id: response.id,
  name: response.name,
  contactPerson: response.contact_person,
  phone: response.phone,
  email: response.email,
  address: response.address,
  isActive: response.is_active,
  createdAt: response.created_at,
});

const toPrintItem = (response: DispensePrintItemApiResponse): DispensePrintItem => ({
  medicineName: response.medicine_name,
  quantity: response.quantity,
  unitPrice: toPriceString(response.unit_price),
  batchNumber: response.batch_number,
  expiryDate: response.expiry_date,
  instructions: response.instructions,
});

const emptyToNull = (value: string | null | undefined): string | null => {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const toItemBody = (item: DispenseItemPayload): DispenseItemRequestBody => ({
  prescription_item_id: item.prescriptionItemId ?? null,
  medicine_id: item.medicineId ?? null,
  batch_id: item.batchId ?? null,
  medicine_name: item.medicineName,
  quantity: item.quantity,
  unit_price: emptyToNull(item.unitPrice ?? undefined),
  instructions: emptyToNull(item.instructions ?? undefined),
  sort_order: item.sortOrder,
});

export const pharmacyApi = {
  // Medicines
  async listMedicines(params: PharmacyMedicineListParams = {}): Promise<PharmacyMedicineListResult> {
    const { data } = await httpClient.get<PharmacyMedicineListApiResponse>("/pharmacy/medicines", {
      params: {
        page: params.page,
        page_size: params.pageSize,
        sort_by: params.sortBy,
        sort_dir: params.sortDir,
      },
    });
    return toMedicineListResult(data);
  },

  async searchMedicines(query: string, limit = 20): Promise<PharmacyMedicineSearchResult> {
    const { data } = await httpClient.get<PharmacyMedicineSearchApiResponse>("/pharmacy/medicines/search", {
      params: { q: query, limit },
    });
    return { items: data.items.map(toMedicine) };
  },

  async getMedicine(id: string): Promise<PharmacyMedicine> {
    const { data } = await httpClient.get<PharmacyMedicineApiResponse>(`/pharmacy/medicines/${id}`);
    return toMedicine(data);
  },

  async createMedicine(payload: CreateMedicinePayload): Promise<PharmacyMedicine> {
    const body: PharmacyMedicineCreateRequestBody = {
      medicine_code: payload.medicineCode,
      generic_name: payload.genericName,
      brand_name: payload.brandName,
      strength: emptyToNull(payload.strength ?? undefined),
      dosage_form: emptyToNull(payload.dosageForm ?? undefined),
      manufacturer: emptyToNull(payload.manufacturer ?? undefined),
      category: payload.category,
      mrp: emptyToNull(payload.mrp ?? undefined),
      selling_price: emptyToNull(payload.sellingPrice ?? undefined),
      gst: emptyToNull(payload.gst ?? undefined),
      barcode: emptyToNull(payload.barcode ?? undefined),
      is_active: payload.isActive ?? true,
    };
    const { data } = await httpClient.post<PharmacyMedicineApiResponse>("/pharmacy/medicines", body);
    return toMedicine(data);
  },

  async updateMedicine(id: string, payload: UpdateMedicinePayload): Promise<PharmacyMedicine> {
    const body: PharmacyMedicineUpdateRequestBody = {
      generic_name: payload.genericName,
      brand_name: payload.brandName,
      strength: emptyToNull(payload.strength ?? undefined),
      dosage_form: emptyToNull(payload.dosageForm ?? undefined),
      manufacturer: emptyToNull(payload.manufacturer ?? undefined),
      category: payload.category,
      mrp: emptyToNull(payload.mrp ?? undefined),
      selling_price: emptyToNull(payload.sellingPrice ?? undefined),
      gst: emptyToNull(payload.gst ?? undefined),
      barcode: emptyToNull(payload.barcode ?? undefined),
      is_active: payload.isActive,
    };
    const { data } = await httpClient.put<PharmacyMedicineApiResponse>(`/pharmacy/medicines/${id}`, body);
    return toMedicine(data);
  },

  async removeMedicine(id: string): Promise<void> {
    await httpClient.delete(`/pharmacy/medicines/${id}`);
  },

  // Batches
  async listBatches(params: PharmacyBatchListParams = {}): Promise<PharmacyBatch[]> {
    const { data } = await httpClient.get<PharmacyBatchListApiResponse>("/pharmacy/batches", {
      params: { medicine_id: params.medicineId },
    });
    return data.items.map(toBatch);
  },

  async createBatch(payload: CreateBatchPayload): Promise<PharmacyBatch> {
    const body: PharmacyBatchCreateRequestBody = {
      medicine_id: payload.medicineId,
      batch_number: payload.batchNumber,
      expiry_date: payload.expiryDate,
      quantity: payload.quantity,
      purchase_price: emptyToNull(payload.purchasePrice ?? undefined),
      selling_price: emptyToNull(payload.sellingPrice ?? undefined),
      supplier_id: payload.supplierId ?? null,
    };
    const { data } = await httpClient.post<PharmacyBatchApiResponse>("/pharmacy/batches", body);
    return toBatch(data);
  },

  async updateBatch(id: string, payload: UpdateBatchPayload): Promise<PharmacyBatch> {
    const body: PharmacyBatchUpdateRequestBody = {
      batch_number: payload.batchNumber,
      expiry_date: payload.expiryDate,
      quantity: payload.quantity,
      purchase_price: emptyToNull(payload.purchasePrice ?? undefined),
      selling_price: emptyToNull(payload.sellingPrice ?? undefined),
      supplier_id: payload.supplierId ?? null,
    };
    const { data } = await httpClient.put<PharmacyBatchApiResponse>(`/pharmacy/batches/${id}`, body);
    return toBatch(data);
  },

  // Stock
  async getInventory(params: StockInventoryListParams = {}): Promise<StockInventoryListResult> {
    const { data } = await httpClient.get<StockInventoryListApiResponse>("/pharmacy/stock", {
      params: { page: params.page, page_size: params.pageSize },
    });
    return toInventoryListResult(data);
  },

  async getLowStock(): Promise<MedicineStock[]> {
    const { data } = await httpClient.get<StockInventoryListApiResponse>("/pharmacy/stock/low");
    return data.items.map(toStock);
  },

  async adjustStock(payload: StockAdjustPayload): Promise<MedicineStock> {
    const body: StockAdjustRequestBody = {
      medicine_id: payload.medicineId,
      batch_id: payload.batchId ?? null,
      quantity_delta: payload.quantityDelta,
      notes: emptyToNull(payload.notes ?? undefined),
    };
    const { data } = await httpClient.post<MedicineStockApiResponse>("/pharmacy/stock/adjust", body);
    return toStock(data);
  },

  async getStockHistory(params: StockHistoryListParams = {}): Promise<StockHistoryListResult> {
    const { data } = await httpClient.get<StockHistoryListApiResponse>("/pharmacy/stock/history", {
      params: {
        page: params.page,
        page_size: params.pageSize,
        medicine_id: params.medicineId,
      },
    });
    return {
      items: data.items.map(toMovement),
      total: data.total,
      page: data.page,
      pageSize: data.page_size,
      totalPages: data.total_pages,
    };
  },

  // Dispenses
  async listDispenses(params: DispenseListParams = {}): Promise<DispenseListResult> {
    const { data } = await httpClient.get<DispenseListApiResponse>("/pharmacy/dispenses", {
      params: {
        page: params.page,
        page_size: params.pageSize,
        sort_by: params.sortBy,
        sort_dir: params.sortDir,
        status: params.status,
      },
    });
    return toDispenseListResult(data);
  },

  async searchDispenses(params: DispenseSearchParams): Promise<DispenseListResult> {
    const { data } = await httpClient.get<DispenseListApiResponse>("/pharmacy/dispenses/search", {
      params: { q: params.query, page: params.page, page_size: params.pageSize },
    });
    return toDispenseListResult(data);
  },

  async getDispense(id: string): Promise<DispenseRecord> {
    const { data } = await httpClient.get<DispenseRecordApiResponse>(`/pharmacy/dispenses/${id}`);
    return toDispense(data);
  },

  async getDispensesByPrescription(prescriptionId: string): Promise<DispenseRecord[]> {
    const { data } = await httpClient.get<DispenseListApiResponse>(
      `/pharmacy/dispenses/by-prescription/${prescriptionId}`
    );
    return data.items.map(toDispense);
  },

  async createDispense(payload: CreateDispensePayload): Promise<DispenseRecord> {
    const body: DispenseCreateRequestBody = {
      prescription_id: payload.prescriptionId,
      notes: emptyToNull(payload.notes ?? undefined),
      items: payload.items.map(toItemBody),
    };
    const { data } = await httpClient.post<DispenseRecordApiResponse>("/pharmacy/dispenses", body);
    return toDispense(data);
  },

  async updateDispense(id: string, payload: UpdateDispensePayload): Promise<DispenseRecord> {
    const body: DispenseUpdateRequestBody = {
      notes: emptyToNull(payload.notes ?? undefined),
      items: payload.items.map(toItemBody),
    };
    const { data } = await httpClient.put<DispenseRecordApiResponse>(`/pharmacy/dispenses/${id}`, body);
    return toDispense(data);
  },

  async updateDispenseStatus(id: string, payload: UpdateDispenseStatusPayload): Promise<DispenseRecord> {
    const body: DispenseStatusUpdateRequestBody = {
      status: payload.status,
      notes: emptyToNull(payload.notes ?? undefined),
    };
    const { data } = await httpClient.patch<DispenseRecordApiResponse>(`/pharmacy/dispenses/${id}/status`, body);
    return toDispense(data);
  },

  async removeDispense(id: string): Promise<void> {
    await httpClient.delete(`/pharmacy/dispenses/${id}`);
  },

  async getDispensePrintData(id: string): Promise<DispensePrintData> {
    const { data } = await httpClient.get<DispensePrintApiResponse>(`/pharmacy/dispenses/${id}/print`);
    return {
      dispenseId: data.dispense_id,
      orderNumber: data.order_number,
      prescriptionId: data.prescription_id,
      consultationId: data.consultation_id,
      status: data.status,
      notes: data.notes,
      patientName: data.patient_name,
      patientMrn: data.patient_mrn,
      patientUhid: data.patient_uhid,
      patientGender: data.patient_gender,
      patientDateOfBirth: data.patient_date_of_birth,
      doctorName: data.doctor_name,
      doctorCode: data.doctor_code,
      doctorSpecialization: data.doctor_specialization,
      consultationVisitNumber: data.consultation_visit_number,
      items: data.items.map(toPrintItem),
      dispensedAt: data.dispensed_at,
      createdAt: data.created_at,
    };
  },

  // Suppliers
  async listSuppliers(): Promise<PharmacySupplierListResult> {
    const { data } = await httpClient.get<PharmacySupplierListApiResponse>("/pharmacy/suppliers");
    return { items: data.items.map(toSupplier) };
  },
};
