import { httpClient } from "../../auth/api/httpClient";
import type { PatientApiResponse, PatientListApiResponse, PatientRequestBody } from "./patientsApi.types";
import type {
  CreatePatientPayload,
  Patient,
  PatientListParams,
  PatientListResult,
  PatientSearchParams,
  UpdatePatientPayload,
} from "../types/patient.types";

const toPatient = (response: PatientApiResponse): Patient => ({
  id: response.id,
  mrn: response.mrn,
  uhid: response.uhid,
  firstName: response.first_name,
  middleName: response.middle_name,
  lastName: response.last_name,
  fullName: response.full_name,
  dateOfBirth: response.date_of_birth,
  age: response.age,
  gender: response.gender,
  bloodGroup: response.blood_group,
  maritalStatus: response.marital_status,
  occupation: response.occupation,
  mobile: response.mobile,
  alternateMobile: response.alternate_mobile,
  email: response.email,
  addressLine1: response.address_line1,
  addressLine2: response.address_line2,
  city: response.city,
  state: response.state,
  country: response.country,
  postalCode: response.postal_code,
  emergencyName: response.emergency_name,
  emergencyRelation: response.emergency_relation,
  emergencyMobile: response.emergency_mobile,
  insuranceProvider: response.insurance_provider,
  insuranceNumber: response.insurance_number,
  allergies: response.allergies,
  chronicConditions: response.chronic_conditions,
  notes: response.notes,
  registrationDate: response.registration_date,
  status: response.status,
  createdAt: response.created_at,
  updatedAt: response.updated_at,
  createdBy: response.created_by,
  updatedBy: response.updated_by,
});

const toPatientListResult = (response: PatientListApiResponse): PatientListResult => ({
  items: response.items.map(toPatient),
  total: response.total,
  page: response.page,
  pageSize: response.page_size,
  totalPages: response.total_pages,
});

const toRequestBody = (payload: CreatePatientPayload): PatientRequestBody => ({
  first_name: payload.firstName,
  middle_name: payload.middleName ?? null,
  last_name: payload.lastName,
  date_of_birth: payload.dateOfBirth,
  gender: payload.gender,
  blood_group: payload.bloodGroup ?? null,
  marital_status: payload.maritalStatus ?? null,
  occupation: payload.occupation ?? null,
  mobile: payload.mobile,
  alternate_mobile: payload.alternateMobile ?? null,
  email: payload.email ?? null,
  address_line1: payload.addressLine1 ?? null,
  address_line2: payload.addressLine2 ?? null,
  city: payload.city ?? null,
  state: payload.state ?? null,
  country: payload.country ?? null,
  postal_code: payload.postalCode ?? null,
  emergency_name: payload.emergencyName ?? null,
  emergency_relation: payload.emergencyRelation ?? null,
  emergency_mobile: payload.emergencyMobile ?? null,
  insurance_provider: payload.insuranceProvider ?? null,
  insurance_number: payload.insuranceNumber ?? null,
  allergies: payload.allergies ?? null,
  chronic_conditions: payload.chronicConditions ?? null,
  notes: payload.notes ?? null,
  registration_date: payload.registrationDate ?? null,
});

export const patientsApi = {
  async list(params: PatientListParams = {}): Promise<PatientListResult> {
    const { data } = await httpClient.get<PatientListApiResponse>("/patients", {
      params: {
        page: params.page,
        page_size: params.pageSize,
        sort_by: params.sortBy,
        sort_dir: params.sortDir,
        status: params.status,
        gender: params.gender,
        blood_group: params.bloodGroup,
        city: params.city,
      },
    });
    return toPatientListResult(data);
  },

  async search(params: PatientSearchParams): Promise<PatientListResult> {
    const { data } = await httpClient.get<PatientListApiResponse>("/patients/search", {
      params: { q: params.query, page: params.page, page_size: params.pageSize },
    });
    return toPatientListResult(data);
  },

  async getById(id: string): Promise<Patient> {
    const { data } = await httpClient.get<PatientApiResponse>(`/patients/${id}`);
    return toPatient(data);
  },

  async create(payload: CreatePatientPayload): Promise<Patient> {
    const { data } = await httpClient.post<PatientApiResponse>("/patients", toRequestBody(payload));
    return toPatient(data);
  },

  async update(id: string, payload: UpdatePatientPayload): Promise<Patient> {
    const body: PatientRequestBody = { ...toRequestBody(payload), status: payload.status };
    const { data } = await httpClient.put<PatientApiResponse>(`/patients/${id}`, body);
    return toPatient(data);
  },

  async remove(id: string): Promise<void> {
    await httpClient.delete(`/patients/${id}`);
  },
};
