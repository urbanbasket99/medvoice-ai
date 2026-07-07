from abc import ABC, abstractmethod
from uuid import UUID

from app.modules.voice.domain.entities.voice_recording import VoiceRecording
from app.modules.voice.domain.value_objects import VoiceRecordingListCriteria, VoiceRecordingPage


class ConsultationVoiceContext:
    def __init__(
        self,
        *,
        id: UUID,
        patient_id: UUID,
        doctor_id: UUID,
        visit_number: str,
    ) -> None:
        self.id = id
        self.patient_id = patient_id
        self.doctor_id = doctor_id
        self.visit_number = visit_number


class VoiceRecordingRepository(ABC):
    @abstractmethod
    async def get_by_id(self, recording_id: UUID) -> VoiceRecording | None:
        raise NotImplementedError

    @abstractmethod
    async def get_consultation_context(self, consultation_id: UUID) -> ConsultationVoiceContext | None:
        raise NotImplementedError

    @abstractmethod
    async def has_active_recording(self, consultation_id: UUID) -> bool:
        raise NotImplementedError

    @abstractmethod
    async def create(self, recording: VoiceRecording) -> VoiceRecording:
        raise NotImplementedError

    @abstractmethod
    async def update(self, recording: VoiceRecording) -> VoiceRecording:
        raise NotImplementedError

    @abstractmethod
    async def soft_delete(self, recording_id: UUID) -> bool:
        raise NotImplementedError

    @abstractmethod
    async def list_recordings(self, criteria: VoiceRecordingListCriteria) -> VoiceRecordingPage:
        raise NotImplementedError
