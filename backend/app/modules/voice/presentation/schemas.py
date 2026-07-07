from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.voice.domain.entities.voice_recording import RecordingStatus, VoiceRecording
from app.modules.voice.domain.value_objects import VoiceRecordingPage


class StartRecordingRequest(BaseModel):
    consultation_id: UUID


class StopRecordingRequest(BaseModel):
    recording_id: UUID
    duration_seconds: float = Field(ge=0)


class VoiceRecordingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    consultation_id: UUID
    patient_id: UUID
    doctor_id: UUID
    patient_name: str | None = None
    doctor_name: str | None = None
    consultation_visit_number: str | None = None
    file_name: str | None
    storage_path: str | None
    duration_seconds: float | None
    file_size_bytes: int | None
    audio_format: str | None
    status: RecordingStatus
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_entity(cls, recording: VoiceRecording) -> "VoiceRecordingResponse":
        return cls(
            id=recording.id,
            consultation_id=recording.consultation_id,
            patient_id=recording.patient_id,
            doctor_id=recording.doctor_id,
            patient_name=recording.patient_name,
            doctor_name=recording.doctor_name,
            consultation_visit_number=recording.consultation_visit_number,
            file_name=recording.file_name,
            storage_path=recording.storage_path,
            duration_seconds=recording.duration_seconds,
            file_size_bytes=recording.file_size_bytes,
            audio_format=recording.audio_format,
            status=recording.status,
            created_at=recording.created_at,
            updated_at=recording.updated_at,
        )


class VoiceRecordingListResponse(BaseModel):
    items: list[VoiceRecordingResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

    @classmethod
    def from_page(cls, page: VoiceRecordingPage) -> "VoiceRecordingListResponse":
        return cls(
            items=[VoiceRecordingResponse.from_entity(item) for item in page.items],
            total=page.total,
            page=page.page,
            page_size=page.page_size,
            total_pages=page.total_pages,
        )
