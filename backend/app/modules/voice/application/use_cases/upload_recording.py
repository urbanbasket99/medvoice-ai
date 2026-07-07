from dataclasses import replace

from app.modules.voice.application.dto.voice_dto import UploadRecordingInput
from app.modules.voice.domain.entities.voice_recording import RecordingStatus
from app.modules.voice.domain.exceptions import VoiceRecordingInvalidStateError, VoiceRecordingNotFoundError
from app.modules.voice.domain.repositories.voice_recording_repository import VoiceRecordingRepository


class UploadRecordingUseCase:
    def __init__(self, repository: VoiceRecordingRepository) -> None:
        self._recordings = repository

    async def execute(self, data: UploadRecordingInput):
        recording = await self._recordings.get_by_id(data.recording_id)
        if recording is None:
            raise VoiceRecordingNotFoundError("Recording not found.")
        if recording.status not in {RecordingStatus.RECORDING, RecordingStatus.STOPPED}:
            raise VoiceRecordingInvalidStateError("This recording cannot accept an upload.")

        duration = data.duration_seconds if data.duration_seconds is not None else recording.duration_seconds
        updated = replace(
            recording,
            file_name=data.file_name,
            storage_path=data.storage_path,
            file_size_bytes=data.file_size_bytes,
            audio_format=data.audio_format,
            duration_seconds=duration,
            status=RecordingStatus.COMPLETED,
        )
        return await self._recordings.update(updated)
