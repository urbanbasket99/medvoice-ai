import { httpClient } from "../../auth/api/httpClient";
import type {
  RadiologyOrderApiResponse,
  RadiologyOrderCreateRequestBody,
  RadiologyOrderItemApiResponse,
  RadiologyOrderItemRequestBody,
  RadiologyOrderListApiResponse,
  RadiologyOrderPrintApiResponse,
  RadiologyOrderPrintItemApiResponse,
  RadiologyOrderStatusEventApiResponse,
  RadiologyOrderStatusUpdateRequestBody,
  RadiologyOrderUpdateRequestBody,
  RadiologyTestListApiResponse,
  RadiologyTestMasterApiResponse,
  RadiologyTestSearchApiResponse,
} from "./radiologyApi.types";
import type {
  CreateRadiologyOrderPayload,
  ImagingCategory,
  RadiologyOrder,
  RadiologyOrderItem,
  RadiologyOrderItemPayload,
  RadiologyOrderListParams,
  RadiologyOrderListResult,
  RadiologyOrderPrintData,
  RadiologyOrderPrintItem,
  RadiologyOrderSearchParams,
  RadiologyOrderStatusEvent,
  RadiologyPriority,
  RadiologyStatus,
  RadiologyTestListParams,
  RadiologyTestListResult,
  RadiologyTestMaster,
  RadiologyTestSearchResult,
  UpdateRadiologyOrderPayload,
  UpdateRadiologyOrderStatusPayload,
} from "../types/radiology.types";

const toRadiologyOrderItem = (response: RadiologyOrderItemApiResponse): RadiologyOrderItem => ({
  id: response.id,
  radiologyOrderId: response.radiology_order_id,
  radiologyTestMasterId: response.radiology_test_master_id,
  testName: response.test_name,
  category: response.category as ImagingCategory,
  bodyPart: response.body_part,
  contrastRequired: response.contrast_required,
  instructions: response.instructions,
  sortOrder: response.sort_order,
});

const toStatusEvent = (response: RadiologyOrderStatusEventApiResponse): RadiologyOrderStatusEvent => ({
  id: response.id,
  radiologyOrderId: response.radiology_order_id,
  status: response.status as RadiologyStatus,
  notes: response.notes,
  changedAt: response.changed_at,
});

const toRadiologyOrder = (response: RadiologyOrderApiResponse): RadiologyOrder => ({
  id: response.id,
  consultationId: response.consultation_id,
  patientId: response.patient_id,
  doctorId: response.doctor_id,
  orderNumber: response.order_number,
  priority: response.priority as RadiologyPriority,
  clinicalNotes: response.clinical_notes,
  status: response.status as RadiologyStatus,
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
  items: response.items.map(toRadiologyOrderItem),
  statusHistory: response.status_history.map(toStatusEvent),
});

const toListResult = (response: RadiologyOrderListApiResponse): RadiologyOrderListResult => ({
  items: response.items.map(toRadiologyOrder),
  total: response.total,
  page: response.page,
  pageSize: response.page_size,
  totalPages: response.total_pages,
});

const toRadiologyTest = (response: RadiologyTestMasterApiResponse): RadiologyTestMaster => ({
  id: response.id,
  testCode: response.test_code,
  testName: response.test_name,
  category: response.category as ImagingCategory,
  bodyPart: response.body_part,
  estimatedDuration: response.estimated_duration,
  price: response.price == null ? null : String(response.price),
  isActive: response.is_active,
  createdAt: response.created_at,
});

const toPrintItem = (response: RadiologyOrderPrintItemApiResponse): RadiologyOrderPrintItem => ({
  testName: response.test_name,
  category: response.category,
  bodyPart: response.body_part,
  contrastRequired: response.contrast_required,
  instructions: response.instructions,
});

const emptyToNull = (value: string | null | undefined): string | null => {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const toItemBody = (item: RadiologyOrderItemPayload): RadiologyOrderItemRequestBody => ({
  radiology_test_master_id: item.radiologyTestMasterId ?? null,
  test_name: item.testName,
  category: item.category,
  body_part: item.bodyPart.trim(),
  contrast_required: item.contrastRequired,
  instructions: emptyToNull(item.instructions ?? undefined),
  sort_order: item.sortOrder,
});

export const radiologyApi = {
  async list(params: RadiologyOrderListParams = {}): Promise<RadiologyOrderListResult> {
    const { data } = await httpClient.get<RadiologyOrderListApiResponse>("/radiology-orders", {
      params: {
        page: params.page,
        page_size: params.pageSize,
        sort_by: params.sortBy,
        sort_dir: params.sortDir,
        consultation_id: params.consultationId,
        patient_id: params.patientId,
        doctor_id: params.doctorId,
        status: params.status,
      },
    });
    return toListResult(data);
  },

  async search(params: RadiologyOrderSearchParams): Promise<RadiologyOrderListResult> {
    const { data } = await httpClient.get<RadiologyOrderListApiResponse>("/radiology-orders/search", {
      params: { q: params.query, page: params.page, page_size: params.pageSize },
    });
    return toListResult(data);
  },

  async getById(id: string): Promise<RadiologyOrder> {
    const { data } = await httpClient.get<RadiologyOrderApiResponse>(`/radiology-orders/${id}`);
    return toRadiologyOrder(data);
  },

  async create(payload: CreateRadiologyOrderPayload): Promise<RadiologyOrder> {
    const body: RadiologyOrderCreateRequestBody = {
      consultation_id: payload.consultationId,
      priority: payload.priority,
      clinical_notes: emptyToNull(payload.clinicalNotes ?? undefined),
      items: payload.items.map(toItemBody),
    };
    const { data } = await httpClient.post<RadiologyOrderApiResponse>("/radiology-orders", body);
    return toRadiologyOrder(data);
  },

  async update(id: string, payload: UpdateRadiologyOrderPayload): Promise<RadiologyOrder> {
    const body: RadiologyOrderUpdateRequestBody = {
      priority: payload.priority,
      clinical_notes: emptyToNull(payload.clinicalNotes ?? undefined),
      items: payload.items.map(toItemBody),
    };
    const { data } = await httpClient.put<RadiologyOrderApiResponse>(`/radiology-orders/${id}`, body);
    return toRadiologyOrder(data);
  },

  async updateStatus(id: string, payload: UpdateRadiologyOrderStatusPayload): Promise<RadiologyOrder> {
    const body: RadiologyOrderStatusUpdateRequestBody = {
      status: payload.status,
      notes: emptyToNull(payload.notes ?? undefined),
    };
    const { data } = await httpClient.patch<RadiologyOrderApiResponse>(`/radiology-orders/${id}/status`, body);
    return toRadiologyOrder(data);
  },

  async remove(id: string): Promise<void> {
    await httpClient.delete(`/radiology-orders/${id}`);
  },

  async getPrintData(id: string): Promise<RadiologyOrderPrintData> {
    const { data } = await httpClient.get<RadiologyOrderPrintApiResponse>(`/radiology-orders/${id}/print`);
    return {
      radiologyOrderId: data.radiology_order_id,
      orderNumber: data.order_number,
      consultationId: data.consultation_id,
      priority: data.priority,
      status: data.status,
      clinicalNotes: data.clinical_notes,
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
      createdAt: data.created_at,
    };
  },

  async searchRadiologyTests(query: string, limit = 20): Promise<RadiologyTestSearchResult> {
    const { data } = await httpClient.get<RadiologyTestSearchApiResponse>("/radiology-tests/search", {
      params: { q: query, limit },
    });
    return { items: data.items.map(toRadiologyTest) };
  },

  async listRadiologyTests(params: RadiologyTestListParams = {}): Promise<RadiologyTestListResult> {
    const { data } = await httpClient.get<RadiologyTestListApiResponse>("/radiology-tests", {
      params: { page: params.page, page_size: params.pageSize },
    });
    return {
      items: data.items.map(toRadiologyTest),
      total: data.total,
      page: data.page,
      pageSize: data.page_size,
      totalPages: data.total_pages,
    };
  },
};
