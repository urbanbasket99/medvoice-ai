from dataclasses import dataclass, field
from datetime import UTC, datetime
from uuid import UUID

from app.modules.transcriptions.domain.value_objects import TranscriptionStatus


@dataclass(frozen=True, slots=True)
class TranscriptSegment:
    index: int
    start_seconds: float
    end_seconds: float
    text: str
    speaker_label: str = "Speaker 1"
    confidence: float | None = None


@dataclass(frozen=True, slots=True)
class Transcription:
    id: UUID
    recording_id: UUID | None
    consultation_id: UUID
    patient_id: UUID
    doctor_id: UUID
    language: str | None
    transcript: str | None
    status: TranscriptionStatus
    duration_seconds: float | None
    model_used: str | None
    audio_storage_path: str | None
    segments: tuple[TranscriptSegment, ...] = ()
    error_message: str | None = None
    patient_name: str | None = None
    doctor_name: str | None = None
    consultation_visit_number: str | None = None
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = field(default_factory=lambda: datetime.now(UTC))


@dataclass(frozen=True, slots=True)
class TranscriptionListCriteria:
    page: int = 1
    page_size: int = 20
    sort_by: str = "created_at"
    sort_dir: str = "desc"
    consultation_id: UUID | None = None
    patient_id: UUID | None = None
    doctor_id: UUID | None = None
    status: TranscriptionStatus | None = None


@dataclass(frozen=True, slots=True)
class TranscriptionPage:
    items: list[Transcription]
    total: int
    page: int
    page_size: int
    total_pages: int
