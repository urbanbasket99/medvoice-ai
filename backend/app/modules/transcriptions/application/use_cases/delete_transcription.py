from uuid import UUID

from app.modules.transcriptions.application.services.audio_storage_service import AudioStorageService
from app.modules.transcriptions.domain.exceptions import TranscriptionNotFoundError
from app.modules.transcriptions.domain.repositories.transcription_repository import TranscriptionRepository


class DeleteTranscriptionUseCase:
    def __init__(
        self,
        repository: TranscriptionRepository,
        audio_storage_service: AudioStorageService,
    ) -> None:
        self._transcriptions = repository
        self._storage = audio_storage_service

    async def execute(self, transcription_id: UUID) -> None:
        transcription = await self._transcriptions.get_by_id(transcription_id)
        if transcription is None:
            raise TranscriptionNotFoundError("Transcription not found.")
        if transcription.audio_storage_path:
            try:
                self._storage.delete(transcription.audio_storage_path)
            except OSError:
                pass
        await self._transcriptions.soft_delete(transcription_id)
