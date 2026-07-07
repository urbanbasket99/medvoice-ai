from datetime import UTC, datetime
from uuid import uuid4

from app.modules.voice.application.dto.voice_dto import StartRecordingInput
from app.modules.voice.domain.entities.voice_recording import RecordingStatus, VoiceRecording
from app.modules.voice.domain.exceptions import (
    VoiceConsultationNotFoundError,
    VoiceRecordingAlreadyActiveError,
)
from app.modules.voice.domain.repositories.voice_recording_repository import VoiceRecordingRepository


class StartRecordingUseCase:
    def __init__(self, repository: VoiceRecordingRepository) -> None:
        self._recordings = repository

    async def execute(self, data: StartRecordingInput) -> VoiceRecording:
        context = await self._recordings.get_consultation_context(data.consultation_id)
        if context is None:
            raise VoiceConsultationNotFoundError("The selected consultation does not exist.")

        if await self._recordings.has_active_recording(data.consultation_id):
            raise VoiceRecordingAlreadyActiveError(
                "An active recording already exists for this consultation."
            )

        now = datetime.now(UTC)
        recording = VoiceRecording(
            id=uuid4(),
            consultation_id=context.id,
            patient_id=context.patient_id,
            doctor_id=context.doctor_id,
            file_name=None,
            storage_path=None,
            duration_seconds=None,
            file_size_bytes=None,
            audio_format=None,
            status=RecordingStatus.RECORDING,
            created_at=now,
            updated_at=now,
        )
        return await self._recordings.create(recording)
