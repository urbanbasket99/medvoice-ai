import { httpClient } from "../../auth/api/httpClient";
import type {
  DosageInstructionApiResponse,
  MedicineMasterApiResponse,
  MedicineSearchApiResponse,
  PrescriptionApiResponse,
  PrescriptionCreateRequestBody,
  PrescriptionItemApiResponse,
  PrescriptionItemRequestBody,
  PrescriptionListApiResponse,
  PrescriptionPdfExportApiResponse,
  PrescriptionPrintApiResponse,
  PrescriptionPrintItemApiResponse,
  PrescriptionUpdateRequestBody,
} from "./prescriptionsApi.types";
import type {
  CreatePrescriptionPayload,
  DosageInstruction,
  Frequency,
  MedicineMaster,
  MedicineSearchResult,
  Prescription,
  PrescriptionItem,
  PrescriptionItemPayload,
  PrescriptionListParams,
  PrescriptionListResult,
  PrescriptionPdfExportResult,
  PrescriptionPrintData,
  PrescriptionPrintItem,
  PrescriptionSearchParams,
  Route,
  UpdatePrescriptionPayload,
} from "../types/prescription.types";

const toDosageInstruction = (response: DosageInstructionApiResponse | null): DosageInstruction | null => {
  if (!response) return null;
  return {
    morning: response.morning,
    afternoon: response.afternoon,
    night: response.night,
    beforeFood: response.before_food,
    afterFood: response.after_food,
  };
};

const toDosageInstructionBody = (dosage: DosageInstruction | null | undefined) => {
  if (!dosage) return null;
  return {
    morning: dosage.morning,
    afternoon: dosage.afternoon,
    night: dosage.night,
    before_food: dosage.beforeFood,
    after_food: dosage.afterFood,
  };
};

const toPrescriptionItem = (response: PrescriptionItemApiResponse): PrescriptionItem => ({
  id: response.id,
  prescriptionId: response.prescription_id,
  medicineMasterId: response.medicine_master_id,
  medicineName: response.medicine_name,
  strength: response.strength,
  dosage: response.dosage,
  frequency: response.frequency as Frequency,
  route: response.route as Route,
  duration: response.duration,
  quantity: response.quantity,
  instructions: response.instructions,
  sortOrder: response.sort_order,
  dosageInstruction: toDosageInstruction(response.dosage_instruction),
});

const toPrescription = (response: PrescriptionApiResponse): Prescription => ({
  id: response.id,
  consultationId: response.consultation_id,
  patientId: response.patient_id,
  doctorId: response.doctor_id,
  diagnosis: response.diagnosis,
  advice: response.advice,
  createdAt: response.created_at,
  updatedAt: response.updated_at,
  patientName: response.patient_name,
  patientMrn: response.patient_mrn,
  patientUhid: response.patient_uhid,
  patientGender: response.patient_gender,
  patientDateOfBirth: response.patient_date_of_birth,
  doctorName: response.doctor_name,
  doctorCode: response.doctor_code,
  doctorSpecialization: response.doctor_specialization,
  consultationVisitNumber: response.consultation_visit_number,
  items: response.items.map(toPrescriptionItem),
});

const toListResult = (response: PrescriptionListApiResponse): PrescriptionListResult => ({
  items: response.items.map(toPrescription),
  total: response.total,
  page: response.page,
  pageSize: response.page_size,
  totalPages: response.total_pages,
});

const toMedicine = (response: MedicineMasterApiResponse): MedicineMaster => ({
  id: response.id,
  name: response.name,
  genericName: response.generic_name,
  strength: response.strength,
  form: response.form,
  defaultRoute: response.default_route as Route | null,
  manufacturer: response.manufacturer,
  isActive: response.is_active,
  createdAt: response.created_at,
});

const toPrintItem = (response: PrescriptionPrintItemApiResponse): PrescriptionPrintItem => ({
  medicineName: response.medicine_name,
  strength: response.strength,
  dosage: response.dosage,
  frequency: response.frequency,
  route: response.route,
  duration: response.duration,
  quantity: response.quantity,
  instructions: response.instructions,
  dosageSummary: response.dosage_summary,
});

const emptyToNull = (value: string | null | undefined): string | null => {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const toItemBody = (item: PrescriptionItemPayload): PrescriptionItemRequestBody => ({
  medicine_master_id: item.medicineMasterId ?? null,
  medicine_name: item.medicineName,
  strength: emptyToNull(item.strength ?? undefined),
  dosage: emptyToNull(item.dosage ?? undefined),
  frequency: item.frequency,
  route: item.route,
  duration: emptyToNull(item.duration ?? undefined),
  quantity: emptyToNull(item.quantity ?? undefined),
  instructions: emptyToNull(item.instructions ?? undefined),
  sort_order: item.sortOrder,
  dosage_instruction: toDosageInstructionBody(item.dosageInstruction),
});

export const prescriptionsApi = {
  async list(params: PrescriptionListParams = {}): Promise<PrescriptionListResult> {
    const { data } = await httpClient.get<PrescriptionListApiResponse>("/prescriptions", {
      params: {
        page: params.page,
        page_size: params.pageSize,
        sort_by: params.sortBy,
        sort_dir: params.sortDir,
        consultation_id: params.consultationId,
        patient_id: params.patientId,
        doctor_id: params.doctorId,
      },
    });
    return toListResult(data);
  },

  async search(params: PrescriptionSearchParams): Promise<PrescriptionListResult> {
    const { data } = await httpClient.get<PrescriptionListApiResponse>("/prescriptions/search", {
      params: { q: params.query, page: params.page, page_size: params.pageSize },
    });
    return toListResult(data);
  },

  async getById(id: string): Promise<Prescription> {
    const { data } = await httpClient.get<PrescriptionApiResponse>(`/prescriptions/${id}`);
    return toPrescription(data);
  },

  async create(payload: CreatePrescriptionPayload): Promise<Prescription> {
    const body: PrescriptionCreateRequestBody = {
      consultation_id: payload.consultationId,
      diagnosis: emptyToNull(payload.diagnosis ?? undefined),
      advice: emptyToNull(payload.advice ?? undefined),
      items: payload.items.map(toItemBody),
    };
    const { data } = await httpClient.post<PrescriptionApiResponse>("/prescriptions", body);
    return toPrescription(data);
  },

  async update(id: string, payload: UpdatePrescriptionPayload): Promise<Prescription> {
    const body: PrescriptionUpdateRequestBody = {
      diagnosis: emptyToNull(payload.diagnosis ?? undefined),
      advice: emptyToNull(payload.advice ?? undefined),
      items: payload.items.map(toItemBody),
    };
    const { data } = await httpClient.put<PrescriptionApiResponse>(`/prescriptions/${id}`, body);
    return toPrescription(data);
  },

  async remove(id: string): Promise<void> {
    await httpClient.delete(`/prescriptions/${id}`);
  },

  async getPrintData(id: string): Promise<PrescriptionPrintData> {
    const { data } = await httpClient.get<PrescriptionPrintApiResponse>(`/prescriptions/${id}/print`);
    return {
      prescriptionId: data.prescription_id,
      consultationId: data.consultation_id,
      patientName: data.patient_name,
      patientMrn: data.patient_mrn,
      patientUhid: data.patient_uhid,
      patientGender: data.patient_gender,
      patientDateOfBirth: data.patient_date_of_birth,
      doctorName: data.doctor_name,
      doctorCode: data.doctor_code,
      doctorSpecialization: data.doctor_specialization,
      consultationVisitNumber: data.consultation_visit_number,
      diagnosis: data.diagnosis,
      advice: data.advice,
      items: data.items.map(toPrintItem),
      createdAt: data.created_at,
    };
  },

  async exportPdf(id: string): Promise<PrescriptionPdfExportResult> {
    const { data } = await httpClient.get<PrescriptionPdfExportApiResponse>(`/prescriptions/${id}/export-pdf`);
    return {
      pdfPlaceholder: data.pdf_placeholder,
      message: data.message,
      prescriptionId: data.prescription_id,
    };
  },

  async searchMedicines(query: string, limit = 20): Promise<MedicineSearchResult> {
    const { data } = await httpClient.get<MedicineSearchApiResponse>("/medicines/search", {
      params: { q: query, limit },
    });
    return { items: data.items.map(toMedicine) };
  },
};
