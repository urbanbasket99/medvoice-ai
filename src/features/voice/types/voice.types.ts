export type RecordingStatus = "recording" | "stopped" | "completed" | "failed" | "cancelled";

export type VoiceRecordingSortField = "created_at" | "duration_seconds" | "status";
export type SortDirection = "asc" | "desc";

export interface VoiceRecording {
  id: string;
  consultationId: string;
  patientId: string;
  doctorId: string;
  patientName: string | null;
  doctorName: string | null;
  consultationVisitNumber: string | null;
  fileName: string | null;
  storagePath: string | null;
  durationSeconds: number | null;
  fileSizeBytes: number | null;
  audioFormat: string | null;
  status: RecordingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface VoiceRecordingListParams {
  page?: number;
  pageSize?: number;
  sortBy?: VoiceRecordingSortField;
  sortDir?: SortDirection;
  consultationId?: string;
  patientId?: string;
  doctorId?: string;
  status?: RecordingStatus;
}

export interface VoiceRecordingListResult {
  items: VoiceRecording[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type RecorderPhase = "idle" | "recording" | "paused" | "stopped" | "uploading" | "completed" | "error";
