from app.modules.voice.domain.repositories.voice_recording_repository import VoiceRecordingRepository
from app.modules.voice.domain.value_objects import VoiceRecordingListCriteria


class GetRecordingsUseCase:
    def __init__(self, repository: VoiceRecordingRepository) -> None:
        self._recordings = repository

    async def execute(self, criteria: VoiceRecordingListCriteria):
        return await self._recordings.list_recordings(criteria)
