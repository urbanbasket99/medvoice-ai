from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.transcriptions.application.dto.transcription_dto import (
    StartTranscriptionInput,
    UpdateTranscriptionInput,
    UploadTranscriptionInput,
)
from app.modules.transcriptions.domain.entities.transcription import Transcription, TranscriptionPage
from app.modules.transcriptions.domain.value_objects import TranscriptionStatus


class TranscriptSegmentResponse(BaseModel):
    index: int
    start_seconds: float
    end_seconds: float
    text: str
    speaker_label: str
    confidence: float | None = None


class TranscriptionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    recording_id: UUID | None
    consultation_id: UUID
    patient_id: UUID
    doctor_id: UUID
    patient_name: str | None = None
    doctor_name: str | None = None
    consultation_visit_number: str | None = None
    language: str | None
    transcript: str | None
    status: TranscriptionStatus
    duration_seconds: float | None
    model_used: str | None
    segments: list[TranscriptSegmentResponse] = Field(default_factory=list)
    error_message: str | None = None
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_entity(cls, transcription: Transcription) -> "TranscriptionResponse":
        return cls(
            id=transcription.id,
            recording_id=transcription.recording_id,
            consultation_id=transcription.consultation_id,
            patient_id=transcription.patient_id,
            doctor_id=transcription.doctor_id,
            patient_name=transcription.patient_name,
            doctor_name=transcription.doctor_name,
            consultation_visit_number=transcription.consultation_visit_number,
            language=transcription.language,
            transcript=transcription.transcript,
            status=transcription.status,
            duration_seconds=transcription.duration_seconds,
            model_used=transcription.model_used,
            segments=[
                TranscriptSegmentResponse(
                    index=segment.index,
                    start_seconds=segment.start_seconds,
                    end_seconds=segment.end_seconds,
                    text=segment.text,
                    speaker_label=segment.speaker_label,
                    confidence=segment.confidence,
                )
                for segment in transcription.segments
            ],
            error_message=transcription.error_message,
            created_at=transcription.created_at,
            updated_at=transcription.updated_at,
        )


class TranscriptionListResponse(BaseModel):
    items: list[TranscriptionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

    @classmethod
    def from_page(cls, page: TranscriptionPage) -> "TranscriptionListResponse":
        return cls(
            items=[TranscriptionResponse.from_entity(item) for item in page.items],
            total=page.total,
            page=page.page,
            page_size=page.page_size,
            total_pages=page.total_pages,
        )


class StartTranscriptionRequest(BaseModel):
    transcription_id: UUID | None = None
    recording_id: UUID | None = None
    language: str | None = Field(default=None, max_length=16)

    def to_input(self) -> StartTranscriptionInput:
        return StartTranscriptionInput(
            transcription_id=self.transcription_id,
            recording_id=self.recording_id,
            language=self.language,
        )


class UpdateTranscriptionRequest(BaseModel):
    transcript: str = Field(min_length=1)
    segments: list[TranscriptSegmentResponse] | None = None

    def to_input(self) -> UpdateTranscriptionInput:
        return UpdateTranscriptionInput(
            transcript=self.transcript,
            segments=[segment.model_dump() for segment in self.segments] if self.segments else None,
        )
