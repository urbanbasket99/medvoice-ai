import type { TranscriptionStatus } from "../types/transcription.types";

export interface TranscriptSegmentApiResponse {
  index: number;
  start_seconds: number;
  end_seconds: number;
  text: string;
  speaker_label: string;
  confidence: number | null;
}

export interface TranscriptionApiResponse {
  id: string;
  recording_id: string | null;
  consultation_id: string;
  patient_id: string;
  doctor_id: string;
  patient_name: string | null;
  doctor_name: string | null;
  consultation_visit_number: string | null;
  language: string | null;
  transcript: string | null;
  status: TranscriptionStatus;
  duration_seconds: number | null;
  model_used: string | null;
  segments?: TranscriptSegmentApiResponse[] | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface TranscriptionListApiResponse {
  items: TranscriptionApiResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface StartTranscriptionRequestBody {
  recording_id?: string;
  transcription_id?: string;
  language?: string;
}

export interface UpdateTranscriptionRequestBody {
  transcript: string;
  segments?: TranscriptSegmentApiResponse[];
}
