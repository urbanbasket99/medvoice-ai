from dataclasses import dataclass
from uuid import UUID


@dataclass(frozen=True, slots=True)
class StartRecordingInput:
    consultation_id: UUID


@dataclass(frozen=True, slots=True)
class StopRecordingInput:
    recording_id: UUID
    duration_seconds: float


@dataclass(frozen=True, slots=True)
class UploadRecordingInput:
    recording_id: UUID
    file_name: str
    storage_path: str
    file_size_bytes: int
    audio_format: str
    duration_seconds: float | None = None
