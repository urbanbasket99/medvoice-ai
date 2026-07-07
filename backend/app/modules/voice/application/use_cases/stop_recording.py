from dataclasses import replace
from uuid import UUID

from app.modules.voice.application.dto.voice_dto import StopRecordingInput
from app.modules.voice.domain.entities.voice_recording import RecordingStatus
from app.modules.voice.domain.exceptions import VoiceRecordingInvalidStateError, VoiceRecordingNotFoundError
from app.modules.voice.domain.repositories.voice_recording_repository import VoiceRecordingRepository


class StopRecordingUseCase:
    def __init__(self, repository: VoiceRecordingRepository) -> None:
        self._recordings = repository

    async def execute(self, data: StopRecordingInput) -> VoiceRecording:
        recording = await self._recordings.get_by_id(data.recording_id)
        if recording is None:
            raise VoiceRecordingNotFoundError("Recording not found.")
        if recording.status != RecordingStatus.RECORDING:
            raise VoiceRecordingInvalidStateError("Only active recordings can be stopped.")

        updated = replace(
            recording,
            duration_seconds=data.duration_seconds,
            status=RecordingStatus.STOPPED,
        )
        return await self._recordings.update(updated)
