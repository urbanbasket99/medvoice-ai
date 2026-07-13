import { httpClient } from "../../auth/api/httpClient";
import type {
  AdmissionApiResponse,
  AdmissionChargeApiResponse,
  AdmissionDischargeRequestBody,
  AdmissionFromConsultationRequestBody,
  AdmissionRequestBody,
  AdmissionUpdateRequestBody,
  BedApiResponse,
  BedRequestBody,
  MlcCaseApiResponse,
  NursingNoteApiResponse,
  OtScheduleApiResponse,
  PagedApiResponse,
  WardApiResponse,
  WardRequestBody,
} from "./ipdApi.types";
import type {
  Admission,
  AdmissionCharge,
  AdmissionListParams,
  AdmissionStatus,
  AdmissionType,
  Bed,
  BedListParams,
  BedStatus,
  ChargeType,
  CreateAdmissionChargePayload,
  CreateAdmissionFromConsultationPayload,
  CreateAdmissionPayload,
  CreateBedPayload,
  CreateNursingNotePayload,
  CreateOtSchedulePayload,
  CreateWardPayload,
  DischargeAdmissionPayload,
  GenerateAdmissionInvoicePayload,
  MlcCase,
  NursingNote,
  NursingNoteType,
  OtSchedule,
  OtScheduleStatus,
  PagedResult,
  UpdateAdmissionPayload,
  UpdateBedPayload,
  UpdateOtSchedulePayload,
  UpdateWardPayload,
  UpsertMlcCasePayload,
  Ward,
  WardListParams,
  WardType,
} from "../types/ipd.types";

const emptyToNull = (value: string | null | undefined): string | null => {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const toIsoDateTime = (date: string): string => {
  if (date.includes("T")) return date;
  return `${date}T00:00:00.000Z`;
};

const toWard = (response: WardApiResponse): Ward => ({
  id: response.id,
  code: response.code,
  name: response.name,
  wardType: response.ward_type as WardType,
  floor: response.floor,
  isActive: response.is_active,
  createdAt: response.created_at,
  updatedAt: response.updated_at,
});

const toBed = (response: BedApiResponse): Bed => ({
  id: response.id,
  wardId: response.ward_id,
  bedNumber: response.bed_number,
  status: response.status as BedStatus,
  wardCode: response.ward_code ?? null,
  wardName: response.ward_name ?? null,
  wardType: response.ward_type ?? null,
  wardFloor: response.ward_floor ?? null,
  createdAt: response.created_at,
  updatedAt: response.updated_at,
});

const toAdmission = (response: AdmissionApiResponse): Admission => ({
  id: response.id,
  admissionNumber: response.admission_number,
  patientId: response.patient_id,
  consultationId: response.consultation_id,
  admittingDoctorId: response.admitting_doctor_id,
  bedId: response.bed_id,
  admissionDate: response.admission_date,
  expectedDischargeDate: response.expected_discharge_date,
  admissionType: response.admission_type as AdmissionType,
  status: response.status as AdmissionStatus,
  chiefComplaint: response.chief_complaint,
  diagnosis: response.diagnosis,
  notes: response.notes,
  dischargedAt: response.discharged_at,
  dischargeSummary: response.discharge_summary,
  dischargedBy: response.discharged_by,
  patientName: response.patient_name,
  patientMrn: response.patient_mrn,
  doctorName: response.doctor_name,
  doctorCode: response.doctor_code,
  consultationVisitNumber: response.consultation_visit_number,
  bedNumber: response.bed_number,
  wardName: response.ward_name,
  dischargedByName: response.discharged_by_name,
  createdAt: response.created_at,
  updatedAt: response.updated_at,
});

const toPagedResult = <Api, Item>(
  response: PagedApiResponse<Api>,
  mapper: (item: Api) => Item
): PagedResult<Item> => ({
  items: response.items.map(mapper),
  total: response.total,
  page: response.page,
  pageSize: response.page_size,
  totalPages: response.total_pages,
});

const toWardBody = (payload: CreateWardPayload | UpdateWardPayload): WardRequestBody => ({
  code: payload.code,
  name: payload.name,
  ward_type: payload.wardType,
  floor: emptyToNull(payload.floor ?? undefined),
  is_active: payload.isActive ?? true,
});

const toBedBody = (payload: CreateBedPayload | UpdateBedPayload): BedRequestBody => ({
  ward_id: payload.wardId,
  bed_number: payload.bedNumber,
  status: payload.status,
});

export const ipdApi = {
  async listWards(params: WardListParams = {}): Promise<PagedResult<Ward>> {
    const { data } = await httpClient.get<PagedApiResponse<WardApiResponse>>("/ipd/wards", {
      params: {
        page: params.page,
        page_size: params.pageSize,
        ward_type: params.wardType,
        is_active: params.isActive,
        search: params.search,
      },
    });
    return toPagedResult(data, toWard);
  },

  async createWard(payload: CreateWardPayload): Promise<Ward> {
    const { data } = await httpClient.post<WardApiResponse>("/ipd/wards", toWardBody(payload));
    return toWard(data);
  },

  async updateWard(id: string, payload: UpdateWardPayload): Promise<Ward> {
    const { data } = await httpClient.put<WardApiResponse>(`/ipd/wards/${id}`, toWardBody(payload));
    return toWard(data);
  },

  async removeWard(id: string): Promise<void> {
    await httpClient.delete(`/ipd/wards/${id}`);
  },

  async listBeds(params: BedListParams = {}): Promise<PagedResult<Bed>> {
    const { data } = await httpClient.get<PagedApiResponse<BedApiResponse>>("/ipd/beds", {
      params: {
        page: params.page,
        page_size: params.pageSize,
        ward_id: params.wardId,
        status: params.status,
        search: params.search,
      },
    });
    return toPagedResult(data, toBed);
  },

  async listAvailableBeds(wardId?: string): Promise<Bed[]> {
    const { data } = await httpClient.get<BedApiResponse[]>("/ipd/beds/available", {
      params: wardId ? { ward_id: wardId } : undefined,
    });
    return data.map(toBed);
  },

  async createBed(payload: CreateBedPayload): Promise<Bed> {
    const { data } = await httpClient.post<BedApiResponse>("/ipd/beds", toBedBody(payload));
    return toBed(data);
  },

  async updateBed(id: string, payload: UpdateBedPayload): Promise<Bed> {
    const { data } = await httpClient.put<BedApiResponse>(`/ipd/beds/${id}`, toBedBody(payload));
    return toBed(data);
  },

  async removeBed(id: string): Promise<void> {
    await httpClient.delete(`/ipd/beds/${id}`);
  },

  async listAdmissions(params: AdmissionListParams = {}): Promise<PagedResult<Admission>> {
    const { data } = await httpClient.get<PagedApiResponse<AdmissionApiResponse>>("/ipd/admissions", {
      params: {
        page: params.page,
        page_size: params.pageSize,
        status: params.status,
        admission_type: params.admissionType,
        patient_id: params.patientId,
      },
    });
    return toPagedResult(data, toAdmission);
  },

  async getAdmissionById(id: string): Promise<Admission> {
    const { data } = await httpClient.get<AdmissionApiResponse>(`/ipd/admissions/${id}`);
    return toAdmission(data);
  },

  async createAdmission(payload: CreateAdmissionPayload): Promise<Admission> {
    const body: AdmissionRequestBody = {
      patient_id: payload.patientId,
      admitting_doctor_id: payload.admittingDoctorId,
      admission_date: toIsoDateTime(payload.admissionDate),
      admission_type: payload.admissionType,
      consultation_id: emptyToNull(payload.consultationId ?? undefined),
      bed_id: emptyToNull(payload.bedId ?? undefined),
      expected_discharge_date: payload.expectedDischargeDate
        ? toIsoDateTime(payload.expectedDischargeDate)
        : null,
      chief_complaint: emptyToNull(payload.chiefComplaint ?? undefined),
      diagnosis: emptyToNull(payload.diagnosis ?? undefined),
      notes: emptyToNull(payload.notes ?? undefined),
    };
    const { data } = await httpClient.post<AdmissionApiResponse>("/ipd/admissions", body);
    return toAdmission(data);
  },

  async updateAdmission(id: string, payload: UpdateAdmissionPayload): Promise<Admission> {
    const body: AdmissionUpdateRequestBody = {
      admitting_doctor_id: payload.admittingDoctorId,
      admission_date: toIsoDateTime(payload.admissionDate),
      admission_type: payload.admissionType,
      consultation_id: emptyToNull(payload.consultationId ?? undefined),
      bed_id: emptyToNull(payload.bedId ?? undefined),
      expected_discharge_date: payload.expectedDischargeDate
        ? toIsoDateTime(payload.expectedDischargeDate)
        : null,
      chief_complaint: emptyToNull(payload.chiefComplaint ?? undefined),
      diagnosis: emptyToNull(payload.diagnosis ?? undefined),
      notes: emptyToNull(payload.notes ?? undefined),
    };
    const { data } = await httpClient.put<AdmissionApiResponse>(`/ipd/admissions/${id}`, body);
    return toAdmission(data);
  },

  async dischargeAdmission(id: string, payload: DischargeAdmissionPayload = {}): Promise<Admission> {
    const body: AdmissionDischargeRequestBody = {
      discharge_summary: emptyToNull(payload.dischargeSummary ?? undefined),
    };
    const { data } = await httpClient.post<AdmissionApiResponse>(`/ipd/admissions/${id}/discharge`, body);
    return toAdmission(data);
  },

  async cancelAdmission(id: string): Promise<Admission> {
    const { data } = await httpClient.post<AdmissionApiResponse>(`/ipd/admissions/${id}/cancel`);
    return toAdmission(data);
  },

  async createAdmissionFromConsultation(payload: CreateAdmissionFromConsultationPayload): Promise<Admission> {
    const body: AdmissionFromConsultationRequestBody = {
      consultation_id: payload.consultationId,
      bed_id: emptyToNull(payload.bedId ?? undefined),
      admission_date: toIsoDateTime(payload.admissionDate),
      expected_discharge_date: payload.expectedDischargeDate
        ? toIsoDateTime(payload.expectedDischargeDate)
        : null,
      notes: emptyToNull(payload.notes ?? undefined),
    };
    const { data } = await httpClient.post<AdmissionApiResponse>("/ipd/admissions/from-consultation", body);
    return toAdmission(data);
  },

  async listNursingNotes(admissionId: string): Promise<NursingNote[]> {
    const { data } = await httpClient.get<{ items: NursingNoteApiResponse[] }>(
      `/ipd/admissions/${admissionId}/nursing-notes`
    );
    return data.items.map((item) => ({
      id: item.id,
      admissionId: item.admission_id,
      noteType: item.note_type as NursingNoteType,
      content: item.content,
      recordedAt: item.recorded_at,
      recordedBy: item.recorded_by,
      recordedByName: item.recorded_by_name,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  },

  async createNursingNote(admissionId: string, payload: CreateNursingNotePayload): Promise<NursingNote> {
    const { data } = await httpClient.post<NursingNoteApiResponse>(
      `/ipd/admissions/${admissionId}/nursing-notes`,
      {
        note_type: payload.noteType,
        content: payload.content,
        recorded_at: toIsoDateTime(payload.recordedAt),
      }
    );
    return {
      id: data.id,
      admissionId: data.admission_id,
      noteType: data.note_type as NursingNoteType,
      content: data.content,
      recordedAt: data.recorded_at,
      recordedBy: data.recorded_by,
      recordedByName: data.recorded_by_name,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async deleteNursingNote(admissionId: string, noteId: string): Promise<void> {
    await httpClient.delete(`/ipd/admissions/${admissionId}/nursing-notes/${noteId}`);
  },

  async listOtSchedules(admissionId: string): Promise<OtSchedule[]> {
    const { data } = await httpClient.get<{ items: OtScheduleApiResponse[] }>(
      `/ipd/admissions/${admissionId}/ot-schedules`
    );
    return data.items.map((item) => ({
      id: item.id,
      admissionId: item.admission_id,
      surgeryName: item.surgery_name,
      surgeonId: item.surgeon_id,
      surgeonName: item.surgeon_name,
      surgeonCode: item.surgeon_code,
      theatre: item.theatre,
      scheduledAt: item.scheduled_at,
      status: item.status as OtScheduleStatus,
      notes: item.notes,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  },

  async createOtSchedule(admissionId: string, payload: CreateOtSchedulePayload): Promise<OtSchedule> {
    const { data } = await httpClient.post<OtScheduleApiResponse>(`/ipd/admissions/${admissionId}/ot-schedules`, {
      surgery_name: payload.surgeryName,
      surgeon_id: payload.surgeonId,
      theatre: emptyToNull(payload.theatre ?? undefined),
      scheduled_at: toIsoDateTime(payload.scheduledAt),
      status: payload.status ?? "scheduled",
      notes: emptyToNull(payload.notes ?? undefined),
    });
    return {
      id: data.id,
      admissionId: data.admission_id,
      surgeryName: data.surgery_name,
      surgeonId: data.surgeon_id,
      surgeonName: data.surgeon_name,
      surgeonCode: data.surgeon_code,
      theatre: data.theatre,
      scheduledAt: data.scheduled_at,
      status: data.status as OtScheduleStatus,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async getMlcCase(admissionId: string): Promise<MlcCase | null> {
    const { data } = await httpClient.get<MlcCaseApiResponse | null>(`/ipd/admissions/${admissionId}/mlc`);
    if (!data) return null;
    return {
      id: data.id,
      admissionId: data.admission_id,
      policeStation: data.police_station,
      firNumber: data.fir_number,
      injuryDetails: data.injury_details,
      incidentDatetime: data.incident_datetime,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async upsertMlcCase(admissionId: string, payload: UpsertMlcCasePayload): Promise<MlcCase> {
    const { data } = await httpClient.put<MlcCaseApiResponse>(`/ipd/admissions/${admissionId}/mlc`, {
      police_station: emptyToNull(payload.policeStation ?? undefined),
      fir_number: emptyToNull(payload.firNumber ?? undefined),
      injury_details: emptyToNull(payload.injuryDetails ?? undefined),
      incident_datetime: payload.incidentDatetime ? toIsoDateTime(payload.incidentDatetime) : null,
      is_active: payload.isActive ?? true,
    });
    return {
      id: data.id,
      admissionId: data.admission_id,
      policeStation: data.police_station,
      firNumber: data.fir_number,
      injuryDetails: data.injury_details,
      incidentDatetime: data.incident_datetime,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async listAdmissionCharges(admissionId: string): Promise<AdmissionCharge[]> {
    const { data } = await httpClient.get<{ items: AdmissionChargeApiResponse[] }>(
      `/ipd/admissions/${admissionId}/charges`
    );
    return data.items.map((item) => ({
      id: item.id,
      admissionId: item.admission_id,
      chargeType: item.charge_type as ChargeType,
      description: item.description,
      amount: item.amount,
      chargeDate: item.charge_date,
      invoiceId: item.invoice_id,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  },

  async createAdmissionCharge(admissionId: string, payload: CreateAdmissionChargePayload): Promise<AdmissionCharge> {
    const { data } = await httpClient.post<AdmissionChargeApiResponse>(`/ipd/admissions/${admissionId}/charges`, {
      charge_type: payload.chargeType,
      description: payload.description,
      amount: payload.amount,
      charge_date: payload.chargeDate,
    });
    return {
      id: data.id,
      admissionId: data.admission_id,
      chargeType: data.charge_type as ChargeType,
      description: data.description,
      amount: data.amount,
      chargeDate: data.charge_date,
      invoiceId: data.invoice_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async generateAdmissionInvoice(
    admissionId: string,
    payload: GenerateAdmissionInvoicePayload
  ): Promise<{ invoiceId: string; invoiceNumber: string }> {
    const { data } = await httpClient.post<{ invoice: { id: string; invoice_number: string } }>(
      `/ipd/admissions/${admissionId}/generate-invoice`,
      {
        invoice_date: payload.invoiceDate,
        notes: emptyToNull(payload.notes ?? undefined),
      }
    );
    return { invoiceId: data.invoice.id, invoiceNumber: data.invoice.invoice_number };
  },
};
