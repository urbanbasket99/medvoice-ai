from uuid import UUID

from app.modules.voice.domain.exceptions import VoiceRecordingNotFoundError
from app.modules.voice.domain.repositories.voice_recording_repository import VoiceRecordingRepository


class DeleteRecordingUseCase:
    def __init__(self, repository: VoiceRecordingRepository) -> None:
        self._recordings = repository

    async def execute(self, recording_id: UUID) -> None:
        deleted = await self._recordings.soft_delete(recording_id)
        if not deleted:
            raise VoiceRecordingNotFoundError("Recording not found.")
