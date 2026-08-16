import { httpClient } from "../../auth/api/httpClient";
import type {
  ConsultationApiResponse,
  ConsultationCreateRequestBody,
  ConsultationListApiResponse,
  ConsultationUpdateRequestBody,
  VitalSignsApiResponse,
} from "./consultationsApi.types";
import type {
  Consultation,
  ConsultationListParams,
  ConsultationListResult,
  ConsultationSearchParams,
  CreateConsultationPayload,
  UpdateConsultationPayload,
  VitalSigns,
} from "../types/consultation.types";

const normalizeTime = (value: string | null): string | null =>
  value ? (value.length >= 5 ? value.slice(0, 5) : value) : null;

const toVitalSigns = (
  response: VitalSignsApiResponse | null
): VitalSigns | null => {
  if (!response) return null;

  return {
    bloodPressureSystolic: response.blood_pressure_systolic ?? undefined,
    bloodPressureDiastolic: response.blood_pressure_diastolic ?? undefined,
    pulse: response.pulse ?? undefined,
    temperature: response.temperature ?? undefined,
    spo2: response.spo2 ?? undefined,
    respiratoryRate: response.respiratory_rate ?? undefined,
    weightKg: response.weight_kg ?? undefined,
    heightCm: response.height_cm ?? undefined,
  };
};

const toVitalSignsBody = (
  vitalSigns: VitalSigns | null | undefined
): VitalSignsApiResponse | null => {
  if (!vitalSigns) return null;

  return {
    blood_pressure_systolic: vitalSigns.bloodPressureSystolic ?? null,
    blood_pressure_diastolic: vitalSigns.bloodPressureDiastolic ?? null,
    pulse: vitalSigns.pulse ?? null,
    temperature: vitalSigns.temperature ?? null,
    spo2: vitalSigns.spo2 ?? null,
    respiratory_rate: vitalSigns.respiratoryRate ?? null,
    weight_kg: vitalSigns.weightKg ?? null,
    height_cm: vitalSigns.heightCm ?? null,
  };
};

const toConsultation = (response: ConsultationApiResponse): Consultation => ({
  id: response.id,
  visitNumber: response.visit_number,
  appointmentId: response.appointment_id,
  patientId: response.patient_id,
  doctorId: response.doctor_id,
  patientName: response.patient_name,
  patientMrn: response.patient_mrn,
  patientUhid: response.patient_uhid,
  patientGender: response.patient_gender,
  patientDateOfBirth: response.patient_date_of_birth,
  doctorName: response.doctor_name,
  doctorCode: response.doctor_code,
  appointmentNumber: response.appointment_number,
  appointmentDate: response.appointment_date,
  appointmentTime: normalizeTime(response.appointment_time),
  chiefComplaint: response.chief_complaint,
  historyOfPresentIllness: response.history_of_present_illness,
  pastMedicalHistory: response.past_medical_history,
  familyHistory: response.family_history,
  allergies: response.allergies,
  currentMedications: response.current_medications,
  vitalSigns: toVitalSigns(response.vital_signs),
  physicalExamination: response.physical_examination,
  diagnosis: response.diagnosis,
  assessment: response.assessment,
  treatmentPlan: response.treatment_plan,
  doctorNotes: response.doctor_notes,
  followUpDate: response.follow_up_date,
  status: response.status as Consultation["status"],
  createdAt: response.created_at,
  updatedAt: response.updated_at,
});

const toListResult = (response: ConsultationListApiResponse): ConsultationListResult => ({
  items: response.items.map(toConsultation),
  total: response.total,
  page: response.page,
  pageSize: response.page_size,
  totalPages: response.total_pages,
});

const emptyToNull = (value: string | null | undefined): string | null => {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const toUpdateBody = (payload: UpdateConsultationPayload): ConsultationUpdateRequestBody => ({
  chief_complaint: emptyToNull(payload.chiefComplaint ?? undefined),
  history_of_present_illness: emptyToNull(payload.historyOfPresentIllness ?? undefined),
  past_medical_history: emptyToNull(payload.pastMedicalHistory ?? undefined),
  family_history: emptyToNull(payload.familyHistory ?? undefined),
  allergies: emptyToNull(payload.allergies ?? undefined),
  current_medications: emptyToNull(payload.currentMedications ?? undefined),
  vital_signs: toVitalSignsBody(payload.vitalSigns),
  physical_examination: emptyToNull(payload.physicalExamination ?? undefined),
  diagnosis: emptyToNull(payload.diagnosis ?? undefined),
  assessment: emptyToNull(payload.assessment ?? undefined),
  treatment_plan: emptyToNull(payload.treatmentPlan ?? undefined),
  doctor_notes: emptyToNull(payload.doctorNotes ?? undefined),
  follow_up_date: emptyToNull(payload.followUpDate ?? undefined),
  status: payload.status,
});

export const consultationsApi = {
  async list(params: ConsultationListParams = {}): Promise<ConsultationListResult> {
    const { data } = await httpClient.get<ConsultationListApiResponse>("/consultations", {
      params: {
        page: params.page,
        page_size: params.pageSize,
        sort_by: params.sortBy,
        sort_dir: params.sortDir,
        status: params.status,
        patient_id: params.patientId,
        doctor_id: params.doctorId,
        appointment_id: params.appointmentId,
        date_from: params.dateFrom,
        date_to: params.dateTo,
      },
    });
    return toListResult(data);
  },

  async search(params: ConsultationSearchParams): Promise<ConsultationListResult> {
    const { data } = await httpClient.get<ConsultationListApiResponse>("/consultations/search", {
      params: { q: params.query, page: params.page, page_size: params.pageSize },
    });
    return toListResult(data);
  },

  async getById(id: string): Promise<Consultation> {
    const { data } = await httpClient.get<ConsultationApiResponse>(`/consultations/${id}`);
    return toConsultation(data);
  },

  async create(payload: CreateConsultationPayload): Promise<Consultation> {
    const body: ConsultationCreateRequestBody = { appointment_id: payload.appointmentId };
    const { data } = await httpClient.post<ConsultationApiResponse>("/consultations", body);
    return toConsultation(data);
  },

  async update(id: string, payload: UpdateConsultationPayload): Promise<Consultation> {
    const { data } = await httpClient.put<ConsultationApiResponse>(`/consultations/${id}`, toUpdateBody(payload));
    return toConsultation(data);
  },

  async remove(id: string): Promise<void> {
    await httpClient.delete(`/consultations/${id}`);
  },
};
