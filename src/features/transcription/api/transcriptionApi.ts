import { httpClient } from "../../auth/api/httpClient";
import type {
  StartTranscriptionRequestBody,
  TranscriptionApiResponse,
  TranscriptionListApiResponse,
  UpdateTranscriptionRequestBody,
} from "./transcriptionApi.types";
import type {
  StartTranscriptionPayload,
  Transcription,
  TranscriptionListParams,
  TranscriptionListResult,
  TranscriptSegment,
  UpdateTranscriptionPayload,
  UploadTranscriptionPayload,
} from "../types/transcription.types";

const toSegment = (segment: NonNullable<TranscriptionApiResponse["segments"]>[number]): TranscriptSegment => ({
  index: segment.index,
  startSeconds: segment.start_seconds,
  endSeconds: segment.end_seconds,
  text: segment.text,
  speakerLabel: segment.speaker_label,
  confidence: segment.confidence,
});

const normalizeSegments = (
  segments: TranscriptionApiResponse["segments"] | null | undefined
): TranscriptSegment[] => (Array.isArray(segments) ? segments : []).map(toSegment);

const toTranscription = (response: TranscriptionApiResponse): Transcription => ({
  id: response.id,
  recordingId: response.recording_id,
  consultationId: response.consultation_id,
  patientId: response.patient_id,
  doctorId: response.doctor_id,
  patientName: response.patient_name,
  doctorName: response.doctor_name,
  consultationVisitNumber: response.consultation_visit_number,
  language: response.language,
  transcript: response.transcript,
  status: response.status,
  durationSeconds: response.duration_seconds,
  modelUsed: response.model_used,
  segments: normalizeSegments(response.segments),
  errorMessage: response.error_message,
  createdAt: response.created_at,
  updatedAt: response.updated_at,
});

const toListResult = (response: TranscriptionListApiResponse): TranscriptionListResult => ({
  items: (response.items ?? []).map(toTranscription),
  total: response.total,
  page: response.page,
  pageSize: response.page_size,
  totalPages: response.total_pages,
});

const toSegmentBody = (segment: TranscriptSegment) => ({
  index: segment.index,
  start_seconds: segment.startSeconds,
  end_seconds: segment.endSeconds,
  text: segment.text,
  speaker_label: segment.speakerLabel,
  confidence: segment.confidence,
});

export const transcriptionApi = {
  async list(params: TranscriptionListParams = {}): Promise<TranscriptionListResult> {
    const { data } = await httpClient.get<TranscriptionListApiResponse>("/transcriptions", {
      params: {
        page: params.page,
        page_size: params.pageSize,
        consultation_id: params.consultationId,
        status: params.status,
      },
    });
    return toListResult(data);
  },

  async getById(id: string): Promise<Transcription> {
    const { data } = await httpClient.get<TranscriptionApiResponse>(`/transcriptions/${id}`);
    return toTranscription(data);
  },

  async getByRecordingId(recordingId: string): Promise<Transcription> {
    const { data } = await httpClient.get<TranscriptionApiResponse>(
      `/transcriptions/by-recording/${recordingId}`
    );
    return toTranscription(data);
  },

  async upload(payload: UploadTranscriptionPayload): Promise<Transcription> {
    const formData = new FormData();
    formData.append("consultation_id", payload.consultationId);
    formData.append("file", payload.file);
    if (payload.language) formData.append("language", payload.language);
    if (payload.recordingId) formData.append("recording_id", payload.recordingId);
    const { data } = await httpClient.post<TranscriptionApiResponse>("/transcriptions/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return toTranscription(data);
  },

  async start(payload: StartTranscriptionPayload): Promise<Transcription> {
    const body: StartTranscriptionRequestBody = {
      recording_id: payload.recordingId,
      transcription_id: payload.transcriptionId,
      language: payload.language,
    };
    const { data } = await httpClient.post<TranscriptionApiResponse>("/transcriptions/start", body);
    return toTranscription(data);
  },

  async update(id: string, payload: UpdateTranscriptionPayload): Promise<Transcription> {
    const body: UpdateTranscriptionRequestBody = {
      transcript: payload.transcript,
      segments: payload.segments?.map(toSegmentBody),
    };
    const { data } = await httpClient.put<TranscriptionApiResponse>(`/transcriptions/${id}`, body);
    return toTranscription(data);
  },

  async retry(id: string): Promise<Transcription> {
    const { data } = await httpClient.post<TranscriptionApiResponse>(`/transcriptions/${id}/retry`);
    return toTranscription(data);
  },

  async remove(id: string): Promise<void> {
    await httpClient.delete(`/transcriptions/${id}`);
  },
};
