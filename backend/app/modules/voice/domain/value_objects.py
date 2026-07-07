from dataclasses import dataclass
from enum import Enum
from math import ceil
from uuid import UUID

from app.modules.voice.domain.entities.voice_recording import RecordingStatus, VoiceRecording


class SortDirection(str, Enum):
    ASC = "asc"
    DESC = "desc"


class VoiceRecordingSortField(str, Enum):
    CREATED_AT = "created_at"
    DURATION_SECONDS = "duration_seconds"
    FILE_SIZE_BYTES = "file_size_bytes"


@dataclass(frozen=True, slots=True)
class VoiceRecordingListCriteria:
    page: int = 1
    page_size: int = 20
    sort_by: VoiceRecordingSortField = VoiceRecordingSortField.CREATED_AT
    sort_dir: SortDirection = SortDirection.DESC
    consultation_id: UUID | None = None
    patient_id: UUID | None = None
    doctor_id: UUID | None = None
    status: RecordingStatus | None = None


@dataclass(frozen=True, slots=True)
class VoiceRecordingPage:
    items: list[VoiceRecording]
    total: int
    page: int
    page_size: int

    @property
    def total_pages(self) -> int:
        if self.page_size <= 0:
            return 1
        return max(1, ceil(self.total / self.page_size))
