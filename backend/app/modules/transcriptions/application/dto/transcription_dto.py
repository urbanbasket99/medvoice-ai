from dataclasses import dataclass
from uuid import UUID

from app.modules.transcriptions.domain.value_objects import TranscriptionStatus


@dataclass(frozen=True, slots=True)
class UploadTranscriptionInput:
    consultation_id: UUID
    file_name: str
    content: bytes
    content_type: str | None
    language: str | None = None
    recording_id: UUID | None = None


@dataclass(frozen=True, slots=True)
class StartTranscriptionInput:
    transcription_id: UUID | None = None
    recording_id: UUID | None = None
    language: str | None = None


@dataclass(frozen=True, slots=True)
class UpdateTranscriptionInput:
    transcript: str
    segments: list[dict] | None = None


@dataclass(frozen=True, slots=True)
class VoiceRecordingSnapshot:
    id: UUID
    consultation_id: UUID
    patient_id: UUID
    doctor_id: UUID
    storage_path: str
    file_name: str | None
    audio_format: str | None
    duration_seconds: float | None
    status: str


@dataclass(frozen=True, slots=True)
class ConsultationContext:
    consultation_id: UUID
    patient_id: UUID
    doctor_id: UUID
