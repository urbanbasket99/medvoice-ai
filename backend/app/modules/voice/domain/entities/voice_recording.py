from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from uuid import UUID


class RecordingStatus(str, Enum):
    RECORDING = "recording"
    STOPPED = "stopped"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass(slots=True)
class VoiceRecording:
    id: UUID
    consultation_id: UUID
    patient_id: UUID
    doctor_id: UUID
    file_name: str | None
    storage_path: str | None
    duration_seconds: float | None
    file_size_bytes: int | None
    audio_format: str | None
    status: RecordingStatus
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None
    patient_name: str | None = None
    doctor_name: str | None = None
    consultation_visit_number: str | None = None

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None
