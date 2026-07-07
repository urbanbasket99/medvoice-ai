from app.modules.transcriptions.domain.entities.transcription import TranscriptionListCriteria, TranscriptionPage
from app.modules.transcriptions.domain.repositories.transcription_repository import TranscriptionRepository


class ListTranscriptionsUseCase:
    def __init__(self, repository: TranscriptionRepository) -> None:
        self._transcriptions = repository

    async def execute(self, criteria: TranscriptionListCriteria) -> TranscriptionPage:
        return await self._transcriptions.list(criteria)
