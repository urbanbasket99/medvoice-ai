import { httpClient } from "../../auth/api/httpClient";
import type {
  AppointmentApiResponse,
  AppointmentListApiResponse,
  AppointmentRequestBody,
} from "./appointmentsApi.types";
import type {
  Appointment,
  AppointmentListParams,
  AppointmentListResult,
  AppointmentSearchParams,
  CreateAppointmentPayload,
  UpdateAppointmentPayload,
} from "../types/appointment.types";

const normalizeTime = (value: string): string => (value.length === 5 ? `${value}:00` : value);

const toAppointment = (response: AppointmentApiResponse): Appointment => ({
  id: response.id,
  appointmentNumber: response.appointment_number,
  patientId: response.patient_id,
  doctorId: response.doctor_id,
  patientName: response.patient_name,
  patientUhid: response.patient_uhid,
  doctorName: response.doctor_name,
  doctorCode: response.doctor_code,
  department: response.department,
  appointmentDate: response.appointment_date,
  appointmentTime: response.appointment_time.slice(0, 5),
  durationMinutes: response.duration_minutes,
  appointmentType: response.appointment_type,
  priority: response.priority,
  status: response.status,
  chiefComplaint: response.chief_complaint,
  notes: response.notes,
  room: response.room,
  tokenNumber: response.token_number,
  createdAt: response.created_at,
  updatedAt: response.updated_at,
});

const toListResult = (response: AppointmentListApiResponse): AppointmentListResult => ({
  items: response.items.map(toAppointment),
  total: response.total,
  page: response.page,
  pageSize: response.page_size,
  totalPages: response.total_pages,
});

const toRequestBody = (payload: CreateAppointmentPayload): AppointmentRequestBody => ({
  patient_id: payload.patientId,
  doctor_id: payload.doctorId,
  department: payload.department,
  appointment_date: payload.appointmentDate,
  appointment_time: normalizeTime(payload.appointmentTime),
  duration_minutes: payload.durationMinutes,
  appointment_type: payload.appointmentType,
  priority: payload.priority,
  chief_complaint: payload.chiefComplaint ?? null,
  notes: payload.notes ?? null,
  room: payload.room ?? null,
});

export const appointmentsApi = {
  async list(params: AppointmentListParams = {}): Promise<AppointmentListResult> {
    const { data } = await httpClient.get<AppointmentListApiResponse>("/appointments", {
      params: {
        page: params.page,
        page_size: params.pageSize,
        sort_by: params.sortBy,
        sort_dir: params.sortDir,
        status: params.status,
        priority: params.priority,
        appointment_type: params.appointmentType,
        department: params.department,
        patient_id: params.patientId,
        doctor_id: params.doctorId,
        date_from: params.dateFrom,
        date_to: params.dateTo,
      },
    });
    return toListResult(data);
  },

  async search(params: AppointmentSearchParams): Promise<AppointmentListResult> {
    const { data } = await httpClient.get<AppointmentListApiResponse>("/appointments/search", {
      params: { q: params.query, page: params.page, page_size: params.pageSize },
    });
    return toListResult(data);
  },

  async getById(id: string): Promise<Appointment> {
    const { data } = await httpClient.get<AppointmentApiResponse>(`/appointments/${id}`);
    return toAppointment(data);
  },

  async create(payload: CreateAppointmentPayload): Promise<Appointment> {
    const { data } = await httpClient.post<AppointmentApiResponse>("/appointments", toRequestBody(payload));
    return toAppointment(data);
  },

  async update(id: string, payload: UpdateAppointmentPayload): Promise<Appointment> {
    const body: AppointmentRequestBody = { ...toRequestBody(payload), status: payload.status };
    const { data } = await httpClient.put<AppointmentApiResponse>(`/appointments/${id}`, body);
    return toAppointment(data);
  },

  async remove(id: string): Promise<void> {
    await httpClient.delete(`/appointments/${id}`);
  },
};
