import type { RecordingStatus } from "../types/voice.types";

export interface VoiceRecordingApiResponse {
  id: string;
  consultation_id: string;
  patient_id: string;
  doctor_id: string;
  patient_name: string | null;
  doctor_name: string | null;
  consultation_visit_number: string | null;
  file_name: string | null;
  storage_path: string | null;
  duration_seconds: number | null;
  file_size_bytes: number | null;
  audio_format: string | null;
  status: RecordingStatus;
  created_at: string;
  updated_at: string;
}

export interface VoiceRecordingListApiResponse {
  items: VoiceRecordingApiResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface StartRecordingRequestBody {
  consultation_id: string;
}

export interface StopRecordingRequestBody {
  recording_id: string;
  duration_seconds: number;
}
