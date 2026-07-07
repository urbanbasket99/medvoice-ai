from uuid import UUID

from app.modules.transcriptions.application.dto.transcription_dto import StartTranscriptionInput
from app.modules.transcriptions.application.use_cases.start_transcription import StartTranscriptionUseCase
from app.modules.transcriptions.domain.entities.transcription import Transcription
from app.modules.transcriptions.domain.exceptions import TranscriptionNotFoundError
from app.modules.transcriptions.domain.repositories.transcription_repository import TranscriptionRepository


class GetTranscriptionUseCase:
    def __init__(self, repository: TranscriptionRepository) -> None:
        self._transcriptions = repository

    async def execute(self, transcription_id: UUID) -> Transcription:
        transcription = await self._transcriptions.get_by_id(transcription_id)
        if transcription is None:
            raise TranscriptionNotFoundError("Transcription not found.")
        return transcription


class GetTranscriptionByRecordingUseCase:
    def __init__(self, repository: TranscriptionRepository) -> None:
        self._transcriptions = repository

    async def execute(self, recording_id: UUID) -> Transcription:
        transcription = await self._transcriptions.get_by_recording_id(recording_id)
        if transcription is None:
            raise TranscriptionNotFoundError("No transcription exists for this recording.")
        return transcription


class RetryTranscriptionUseCase:
    def __init__(self, start_use_case: StartTranscriptionUseCase, repository: TranscriptionRepository) -> None:
        self._start = start_use_case
        self._transcriptions = repository

    async def execute(self, transcription_id: UUID) -> Transcription:
        transcription = await self._transcriptions.get_by_id(transcription_id)
        if transcription is None:
            raise TranscriptionNotFoundError("Transcription not found.")
        return await self._start.start_processing(
            StartTranscriptionInput(
                transcription_id=transcription.id,
                language=transcription.language,
            )
        )
