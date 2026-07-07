import { httpClient } from "../../auth/api/httpClient";
import type {
  StartRecordingRequestBody,
  StopRecordingRequestBody,
  VoiceRecordingApiResponse,
  VoiceRecordingListApiResponse,
} from "./voiceApi.types";
import type {
  VoiceRecording,
  VoiceRecordingListParams,
  VoiceRecordingListResult,
} from "../types/voice.types";

const toVoiceRecording = (response: VoiceRecordingApiResponse): VoiceRecording => ({
  id: response.id,
  consultationId: response.consultation_id,
  patientId: response.patient_id,
  doctorId: response.doctor_id,
  patientName: response.patient_name,
  doctorName: response.doctor_name,
  consultationVisitNumber: response.consultation_visit_number,
  fileName: response.file_name,
  storagePath: response.storage_path,
  durationSeconds: response.duration_seconds,
  fileSizeBytes: response.file_size_bytes,
  audioFormat: response.audio_format,
  status: response.status,
  createdAt: response.created_at,
  updatedAt: response.updated_at,
});

const toListResult = (response: VoiceRecordingListApiResponse): VoiceRecordingListResult => ({
  items: response.items.map(toVoiceRecording),
  total: response.total,
  page: response.page,
  pageSize: response.page_size,
  totalPages: response.total_pages,
});

export const voiceApi = {
  async list(params: VoiceRecordingListParams = {}): Promise<VoiceRecordingListResult> {
    const { data } = await httpClient.get<VoiceRecordingListApiResponse>("/voice", {
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

  async getById(id: string): Promise<VoiceRecording> {
    const { data } = await httpClient.get<VoiceRecordingApiResponse>(`/voice/${id}`);
    return toVoiceRecording(data);
  },

  async start(consultationId: string): Promise<VoiceRecording> {
    const body: StartRecordingRequestBody = { consultation_id: consultationId };
    const { data } = await httpClient.post<VoiceRecordingApiResponse>("/voice/start", body);
    return toVoiceRecording(data);
  },

  async stop(recordingId: string, durationSeconds: number): Promise<VoiceRecording> {
    const body: StopRecordingRequestBody = {
      recording_id: recordingId,
      duration_seconds: durationSeconds,
    };
    const { data } = await httpClient.post<VoiceRecordingApiResponse>("/voice/stop", body);
    return toVoiceRecording(data);
  },

  async upload(recordingId: string, file: Blob, durationSeconds: number, fileName = "recording.webm"): Promise<VoiceRecording> {
    const formData = new FormData();
    formData.append("recording_id", recordingId);
    formData.append("duration_seconds", String(durationSeconds));
    formData.append("file", file, fileName);

    const { data } = await httpClient.post<VoiceRecordingApiResponse>("/voice/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return toVoiceRecording(data);
  },

  async downloadBlob(id: string): Promise<Blob> {
    const { data } = await httpClient.get<Blob>(`/voice/${id}/download`, {
      responseType: "blob",
    });
    return data;
  },

  async remove(id: string): Promise<void> {
    await httpClient.delete(`/voice/${id}`);
  },
};
