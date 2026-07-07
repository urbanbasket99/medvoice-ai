import { httpClient } from "../../auth/api/httpClient";
import type {
  LabOrderApiResponse,
  LabOrderCreateRequestBody,
  LabOrderItemApiResponse,
  LabOrderItemRequestBody,
  LabOrderListApiResponse,
  LabOrderPrintApiResponse,
  LabOrderPrintItemApiResponse,
  LabOrderStatusEventApiResponse,
  LabOrderStatusUpdateRequestBody,
  LabOrderUpdateRequestBody,
  LabTestListApiResponse,
  LabTestMasterApiResponse,
  LabTestSearchApiResponse,
} from "./laboratoryApi.types";
import type {
  CreateLabOrderPayload,
  LabOrder,
  LabOrderItem,
  LabOrderItemPayload,
  LabOrderListParams,
  LabOrderListResult,
  LabOrderPrintData,
  LabOrderPrintItem,
  LabOrderSearchParams,
  LabOrderStatusEvent,
  LabPriority,
  LabStatus,
  LabTestListParams,
  LabTestListResult,
  LabTestMaster,
  LabTestSearchResult,
  SampleType,
  UpdateLabOrderPayload,
  UpdateLabOrderStatusPayload,
} from "../types/laboratory.types";

const toLabOrderItem = (response: LabOrderItemApiResponse): LabOrderItem => ({
  id: response.id,
  labOrderId: response.lab_order_id,
  labTestMasterId: response.lab_test_master_id,
  labTestName: response.lab_test_name,
  category: response.category,
  sampleType: response.sample_type as SampleType,
  instructions: response.instructions,
  sortOrder: response.sort_order,
});

const toStatusEvent = (response: LabOrderStatusEventApiResponse): LabOrderStatusEvent => ({
  id: response.id,
  labOrderId: response.lab_order_id,
  status: response.status as LabStatus,
  notes: response.notes,
  changedAt: response.changed_at,
});

const toLabOrder = (response: LabOrderApiResponse): LabOrder => ({
  id: response.id,
  consultationId: response.consultation_id,
  patientId: response.patient_id,
  doctorId: response.doctor_id,
  orderNumber: response.order_number,
  priority: response.priority as LabPriority,
  clinicalNotes: response.clinical_notes,
  status: response.status as LabStatus,
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
  items: response.items.map(toLabOrderItem),
  statusHistory: response.status_history.map(toStatusEvent),
});

const toListResult = (response: LabOrderListApiResponse): LabOrderListResult => ({
  items: response.items.map(toLabOrder),
  total: response.total,
  page: response.page,
  pageSize: response.page_size,
  totalPages: response.total_pages,
});

const toLabTest = (response: LabTestMasterApiResponse): LabTestMaster => ({
  id: response.id,
  testCode: response.test_code,
  testName: response.test_name,
  department: response.department,
  sampleType: response.sample_type as SampleType,
  normalTurnaroundTime: response.normal_turnaround_time,
  price: response.price == null ? null : String(response.price),
  isActive: response.is_active,
  createdAt: response.created_at,
});

const toPrintItem = (response: LabOrderPrintItemApiResponse): LabOrderPrintItem => ({
  labTestName: response.lab_test_name,
  category: response.category,
  sampleType: response.sample_type,
  instructions: response.instructions,
});

const emptyToNull = (value: string | null | undefined): string | null => {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const toItemBody = (item: LabOrderItemPayload): LabOrderItemRequestBody => ({
  lab_test_master_id: item.labTestMasterId ?? null,
  lab_test_name: item.labTestName,
  category: emptyToNull(item.category ?? undefined),
  sample_type: item.sampleType,
  instructions: emptyToNull(item.instructions ?? undefined),
  sort_order: item.sortOrder,
});

export const laboratoryApi = {
  async list(params: LabOrderListParams = {}): Promise<LabOrderListResult> {
    const { data } = await httpClient.get<LabOrderListApiResponse>("/lab-orders", {
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

  async search(params: LabOrderSearchParams): Promise<LabOrderListResult> {
    const { data } = await httpClient.get<LabOrderListApiResponse>("/lab-orders/search", {
      params: { q: params.query, page: params.page, page_size: params.pageSize },
    });
    return toListResult(data);
  },

  async getById(id: string): Promise<LabOrder> {
    const { data } = await httpClient.get<LabOrderApiResponse>(`/lab-orders/${id}`);
    return toLabOrder(data);
  },

  async create(payload: CreateLabOrderPayload): Promise<LabOrder> {
    const body: LabOrderCreateRequestBody = {
      consultation_id: payload.consultationId,
      priority: payload.priority,
      clinical_notes: emptyToNull(payload.clinicalNotes ?? undefined),
      items: payload.items.map(toItemBody),
    };
    const { data } = await httpClient.post<LabOrderApiResponse>("/lab-orders", body);
    return toLabOrder(data);
  },

  async update(id: string, payload: UpdateLabOrderPayload): Promise<LabOrder> {
    const body: LabOrderUpdateRequestBody = {
      priority: payload.priority,
      clinical_notes: emptyToNull(payload.clinicalNotes ?? undefined),
      items: payload.items.map(toItemBody),
    };
    const { data } = await httpClient.put<LabOrderApiResponse>(`/lab-orders/${id}`, body);
    return toLabOrder(data);
  },

  async updateStatus(id: string, payload: UpdateLabOrderStatusPayload): Promise<LabOrder> {
    const body: LabOrderStatusUpdateRequestBody = {
      status: payload.status,
      notes: emptyToNull(payload.notes ?? undefined),
    };
    const { data } = await httpClient.patch<LabOrderApiResponse>(`/lab-orders/${id}/status`, body);
    return toLabOrder(data);
  },

  async remove(id: string): Promise<void> {
    await httpClient.delete(`/lab-orders/${id}`);
  },

  async getPrintData(id: string): Promise<LabOrderPrintData> {
    const { data } = await httpClient.get<LabOrderPrintApiResponse>(`/lab-orders/${id}/print`);
    return {
      labOrderId: data.lab_order_id,
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

  async searchLabTests(query: string, limit = 20): Promise<LabTestSearchResult> {
    const { data } = await httpClient.get<LabTestSearchApiResponse>("/lab-tests/search", {
      params: { q: query, limit },
    });
    return { items: data.items.map(toLabTest) };
  },

  async listLabTests(params: LabTestListParams = {}): Promise<LabTestListResult> {
    const { data } = await httpClient.get<LabTestListApiResponse>("/lab-tests", {
      params: { page: params.page, page_size: params.pageSize },
    });
    return {
      items: data.items.map(toLabTest),
      total: data.total,
      page: data.page,
      pageSize: data.page_size,
      totalPages: data.total_pages,
    };
  },
};
