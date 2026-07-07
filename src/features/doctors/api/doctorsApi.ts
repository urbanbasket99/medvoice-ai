import { httpClient } from "../../auth/api/httpClient";
import type { DoctorApiResponse, DoctorListApiResponse, DoctorRequestBody } from "./doctorsApi.types";
import type {
  CreateDoctorPayload,
  Doctor,
  DoctorListParams,
  DoctorListResult,
  DoctorSearchParams,
  UpdateDoctorPayload,
} from "../types/doctor.types";

const parseFee = (value: string | number | null): number | null => {
  if (value === null || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const toDoctor = (response: DoctorApiResponse): Doctor => ({
  id: response.id,
  doctorCode: response.doctor_code,
  fullName: response.full_name,
  age: response.age,
  gender: response.gender,
  dateOfBirth: response.date_of_birth,
  department: response.department,
  specialization: response.specialization,
  qualification: response.qualification,
  registrationNumber: response.registration_number,
  experienceYears: response.experience_years,
  mobile: response.mobile,
  email: response.email,
  address: response.address,
  languagesSpoken: response.languages_spoken,
  consultationFee: parseFee(response.consultation_fee),
  workingHours: response.working_hours,
  photoUrl: response.photo_url,
  joiningDate: response.joining_date,
  status: response.status,
  createdAt: response.created_at,
  updatedAt: response.updated_at,
});

const toDoctorListResult = (response: DoctorListApiResponse): DoctorListResult => ({
  items: response.items.map(toDoctor),
  total: response.total,
  page: response.page,
  pageSize: response.page_size,
  totalPages: response.total_pages,
});

const parseLanguages = (value: string | undefined): string[] =>
  (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const toRequestBody = (payload: CreateDoctorPayload): DoctorRequestBody => ({
  full_name: payload.fullName,
  gender: payload.gender,
  date_of_birth: payload.dateOfBirth,
  department: payload.department,
  specialization: payload.specialization,
  qualification: payload.qualification,
  registration_number: payload.registrationNumber,
  experience_years: payload.experienceYears,
  mobile: payload.mobile,
  email: payload.email ?? null,
  address: payload.address ?? null,
  languages_spoken: payload.languagesSpoken ?? [],
  consultation_fee: payload.consultationFee ?? null,
  working_hours: payload.workingHours ?? null,
  photo_url: payload.photoUrl ?? null,
  joining_date: payload.joiningDate ?? null,
});

export const doctorsApi = {
  async list(params: DoctorListParams = {}): Promise<DoctorListResult> {
    const { data } = await httpClient.get<DoctorListApiResponse>("/doctors", {
      params: {
        page: params.page,
        page_size: params.pageSize,
        sort_by: params.sortBy,
        sort_dir: params.sortDir,
        status: params.status,
        department: params.department,
        gender: params.gender,
        specialization: params.specialization,
      },
    });
    return toDoctorListResult(data);
  },

  async search(params: DoctorSearchParams): Promise<DoctorListResult> {
    const { data } = await httpClient.get<DoctorListApiResponse>("/doctors/search", {
      params: { q: params.query, page: params.page, page_size: params.pageSize },
    });
    return toDoctorListResult(data);
  },

  async getById(id: string): Promise<Doctor> {
    const { data } = await httpClient.get<DoctorApiResponse>(`/doctors/${id}`);
    return toDoctor(data);
  },

  async create(payload: CreateDoctorPayload): Promise<Doctor> {
    const { data } = await httpClient.post<DoctorApiResponse>("/doctors", toRequestBody(payload));
    return toDoctor(data);
  },

  async update(id: string, payload: UpdateDoctorPayload): Promise<Doctor> {
    const body: DoctorRequestBody = { ...toRequestBody(payload), status: payload.status };
    const { data } = await httpClient.put<DoctorApiResponse>(`/doctors/${id}`, body);
    return toDoctor(data);
  },

  async remove(id: string): Promise<void> {
    await httpClient.delete(`/doctors/${id}`);
  },

  parseLanguages,
};
