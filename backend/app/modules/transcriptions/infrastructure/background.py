from uuid import UUID

from app.db.session import AsyncSessionLocal
from app.modules.ai.infrastructure.provider_registry import ProviderRegistry
from app.modules.ai.infrastructure.settings.json_file_ai_settings_repository import JsonFileAiSettingsRepository
from app.modules.transcriptions.application.services.speech_to_text_service import SpeechToTextService
from app.modules.transcriptions.application.use_cases.start_transcription import StartTranscriptionUseCase
from app.modules.transcriptions.infrastructure.repositories.sqlalchemy_transcription_repository import (
    SqlAlchemyTranscriptionRepository,
)
from app.modules.transcriptions.infrastructure.repositories.voice_recording_lookup import SqlAlchemyVoiceRecordingLookup


async def run_transcription_processing(transcription_id: UUID, language: str | None) -> None:
    """Run Whisper in a background task with its own DB session."""
    async with AsyncSessionLocal() as session:
        try:
            repository = SqlAlchemyTranscriptionRepository(session)
            voice_lookup = SqlAlchemyVoiceRecordingLookup(session)
            speech_to_text = SpeechToTextService(ProviderRegistry(), JsonFileAiSettingsRepository())
            use_case = StartTranscriptionUseCase(repository, speech_to_text, voice_lookup)
            await use_case.complete_processing(transcription_id, language)
            await session.commit()
        except Exception:
            await session.rollback()
            raise
