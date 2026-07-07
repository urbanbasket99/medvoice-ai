from abc import ABC, abstractmethod
from uuid import UUID

from app.modules.transcriptions.application.dto.transcription_dto import ConsultationContext, VoiceRecordingSnapshot


class VoiceRecordingLookup(ABC):
    @abstractmethod
    async def get_completed_recording(self, recording_id: UUID) -> VoiceRecordingSnapshot | None:
        """Return a completed voice recording snapshot for transcription."""

    @abstractmethod
    async def get_consultation_context(self, consultation_id: UUID) -> ConsultationContext | None:
        """Resolve consultation ownership for direct audio uploads."""
