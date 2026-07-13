import { httpClient } from "../../auth/api/httpClient";
import type {
  CertificateApiResponse,
  CertificateListApiResponse,
  CertificatePrintApiResponse,
  CertificateRequestBody,
} from "./certificatesApi.types";
import type {
  CertificateListParams,
  CertificateListResult,
  CertificatePrintData,
  CertificateType,
  CreateCertificatePayload,
  MedicalCertificate,
  UpdateCertificatePayload,
} from "../types/certificate.types";

const toCertificate = (response: CertificateApiResponse): MedicalCertificate => ({
  id: response.id,
  certificateNumber: response.certificate_number,
  patientId: response.patient_id,
  doctorId: response.doctor_id,
  consultationId: response.consultation_id,
  certificateType: response.certificate_type as CertificateType,
  issueDate: response.issue_date,
  validFrom: response.valid_from,
  validTo: response.valid_to,
  diagnosis: response.diagnosis,
  remarks: response.remarks,
  fitnessStatus: response.fitness_status,
  restDays: response.rest_days,
  issuedBy: response.issued_by,
  createdAt: response.created_at,
  updatedAt: response.updated_at,
  patientName: response.patient_name,
  patientMrn: response.patient_mrn,
  patientUhid: response.patient_uhid,
  doctorName: response.doctor_name,
  doctorCode: response.doctor_code,
});

const emptyToNull = (value: string | null | undefined): string | null => {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const toBody = (payload: CreateCertificatePayload | UpdateCertificatePayload): CertificateRequestBody => ({
  patient_id: payload.patientId,
  doctor_id: payload.doctorId,
  consultation_id: payload.consultationId ?? null,
  certificate_type: payload.certificateType,
  issue_date: payload.issueDate,
  valid_from: emptyToNull(payload.validFrom ?? undefined),
  valid_to: emptyToNull(payload.validTo ?? undefined),
  diagnosis: emptyToNull(payload.diagnosis ?? undefined),
  remarks: emptyToNull(payload.remarks ?? undefined),
  fitness_status: emptyToNull(payload.fitnessStatus ?? undefined),
  rest_days: payload.restDays ?? null,
});

export const certificatesApi = {
  async list(params: CertificateListParams = {}): Promise<CertificateListResult> {
    const { data } = await httpClient.get<CertificateListApiResponse>("/certificates", {
      params: {
        page: params.page,
        page_size: params.pageSize,
        sort_by: params.sortBy,
        sort_dir: params.sortDir,
        patient_id: params.patientId,
        doctor_id: params.doctorId,
        certificate_type: params.certificateType,
      },
    });
    return {
      items: data.items.map(toCertificate),
      total: data.total,
      page: data.page,
      pageSize: data.page_size,
      totalPages: data.total_pages,
    };
  },

  async getById(id: string): Promise<MedicalCertificate> {
    const { data } = await httpClient.get<CertificateApiResponse>(`/certificates/${id}`);
    return toCertificate(data);
  },

  async create(payload: CreateCertificatePayload): Promise<MedicalCertificate> {
    const { data } = await httpClient.post<CertificateApiResponse>("/certificates", toBody(payload));
    return toCertificate(data);
  },

  async update(id: string, payload: UpdateCertificatePayload): Promise<MedicalCertificate> {
    const { data } = await httpClient.put<CertificateApiResponse>(`/certificates/${id}`, toBody(payload));
    return toCertificate(data);
  },

  async remove(id: string): Promise<void> {
    await httpClient.delete(`/certificates/${id}`);
  },

  async getPrintData(id: string): Promise<CertificatePrintData> {
    const { data } = await httpClient.get<CertificatePrintApiResponse>(`/certificates/${id}/print`);
    return {
      certificateId: data.certificate_id,
      certificateNumber: data.certificate_number,
      certificateType: data.certificate_type,
      issueDate: data.issue_date,
      validFrom: data.valid_from,
      validTo: data.valid_to,
      diagnosis: data.diagnosis,
      remarks: data.remarks,
      fitnessStatus: data.fitness_status,
      restDays: data.rest_days,
      patientName: data.patient_name,
      patientMrn: data.patient_mrn,
      patientUhid: data.patient_uhid,
      patientGender: data.patient_gender,
      patientDateOfBirth: data.patient_date_of_birth,
      doctorName: data.doctor_name,
      doctorCode: data.doctor_code,
      doctorSpecialization: data.doctor_specialization,
      createdAt: data.created_at,
    };
  },
};
