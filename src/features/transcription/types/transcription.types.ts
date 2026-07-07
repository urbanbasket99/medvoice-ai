export type TranscriptionStatus = "pending" | "processing" | "completed" | "failed";

export interface TranscriptSegment {
  index: number;
  startSeconds: number;
  endSeconds: number;
  text: string;
  speakerLabel: string;
  confidence: number | null;
}

export interface Transcription {
  id: string;
  recordingId: string | null;
  consultationId: string;
  patientId: string;
  doctorId: string;
  patientName: string | null;
  doctorName: string | null;
  consultationVisitNumber: string | null;
  language: string | null;
  transcript: string | null;
  status: TranscriptionStatus;
  durationSeconds: number | null;
  modelUsed: string | null;
  segments: TranscriptSegment[];
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TranscriptionListParams {
  page?: number;
  pageSize?: number;
  consultationId?: string;
  status?: TranscriptionStatus;
}

export interface TranscriptionListResult {
  items: Transcription[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface StartTranscriptionPayload {
  recordingId?: string;
  transcriptionId?: string;
  language?: string;
}

export interface UpdateTranscriptionPayload {
  transcript: string;
  segments?: TranscriptSegment[];
}

export interface UploadTranscriptionPayload {
  consultationId: string;
  file: File;
  language?: string;
  recordingId?: string;
}
