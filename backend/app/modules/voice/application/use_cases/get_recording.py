from uuid import UUID

from app.modules.voice.domain.exceptions import VoiceRecordingNotFoundError
from app.modules.voice.domain.repositories.voice_recording_repository import VoiceRecordingRepository


class GetRecordingUseCase:
    def __init__(self, repository: VoiceRecordingRepository) -> None:
        self._recordings = repository

    async def execute(self, recording_id: UUID):
        recording = await self._recordings.get_by_id(recording_id)
        if recording is None:
            raise VoiceRecordingNotFoundError("Recording not found.")
        return recording
