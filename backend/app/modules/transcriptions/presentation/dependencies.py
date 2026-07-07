from typing import Annotated

from fastapi import Depends

from app.api.deps import DbSession, require_permission
from app.domain.entities.user import User
from app.modules.ai.infrastructure.provider_registry import ProviderRegistry
from app.modules.ai.infrastructure.settings.json_file_ai_settings_repository import JsonFileAiSettingsRepository
from app.modules.transcriptions.application.services.audio_upload_service import AudioUploadService
from app.modules.transcriptions.application.services.speech_to_text_service import SpeechToTextService
from app.modules.transcriptions.application.use_cases.delete_transcription import DeleteTranscriptionUseCase
from app.modules.transcriptions.application.use_cases.get_transcription import (
    GetTranscriptionByRecordingUseCase,
    GetTranscriptionUseCase,
    RetryTranscriptionUseCase,
)
from app.modules.transcriptions.application.use_cases.list_transcriptions import ListTranscriptionsUseCase
from app.modules.transcriptions.application.use_cases.start_transcription import StartTranscriptionUseCase
from app.modules.transcriptions.application.use_cases.update_transcription import UpdateTranscriptionUseCase
from app.modules.transcriptions.application.use_cases.upload_transcription import UploadTranscriptionUseCase
from app.modules.transcriptions.domain.repositories.transcription_repository import TranscriptionRepository
from app.modules.transcriptions.application.interfaces.voice_recording_lookup import VoiceRecordingLookup
from app.modules.transcriptions.application.services.audio_storage_service import AudioStorageService
from app.modules.transcriptions.infrastructure.repositories.sqlalchemy_transcription_repository import (
    SqlAlchemyTranscriptionRepository,
)
from app.modules.transcriptions.infrastructure.repositories.voice_recording_lookup import SqlAlchemyVoiceRecordingLookup
from app.modules.transcriptions.infrastructure.storage.file_audio_storage_service import FileAudioStorageService


def get_transcription_repository(db: DbSession) -> TranscriptionRepository:
    return SqlAlchemyTranscriptionRepository(db)


def get_voice_recording_lookup(db: DbSession) -> VoiceRecordingLookup:
    return SqlAlchemyVoiceRecordingLookup(db)


def get_audio_storage_service() -> AudioStorageService:
    return FileAudioStorageService()


def get_audio_upload_service() -> AudioUploadService:
    return AudioUploadService()


def get_speech_to_text_service() -> SpeechToTextService:
    return SpeechToTextService(ProviderRegistry(), JsonFileAiSettingsRepository())


TranscriptionRepositoryDep = Annotated[TranscriptionRepository, Depends(get_transcription_repository)]
VoiceRecordingLookupDep = Annotated[VoiceRecordingLookup, Depends(get_voice_recording_lookup)]
AudioStorageServiceDep = Annotated[AudioStorageService, Depends(get_audio_storage_service)]
AudioUploadServiceDep = Annotated[AudioUploadService, Depends(get_audio_upload_service)]
SpeechToTextServiceDep = Annotated[SpeechToTextService, Depends(get_speech_to_text_service)]


def provide_upload_transcription_use_case(
    repository: TranscriptionRepositoryDep,
    upload_service: AudioUploadServiceDep,
    storage_service: AudioStorageServiceDep,
    voice_lookup: VoiceRecordingLookupDep,
) -> UploadTranscriptionUseCase:
    return UploadTranscriptionUseCase(repository, upload_service, storage_service, voice_lookup)


def provide_start_transcription_use_case(
    repository: TranscriptionRepositoryDep,
    speech_to_text_service: SpeechToTextServiceDep,
    voice_lookup: VoiceRecordingLookupDep,
) -> StartTranscriptionUseCase:
    return StartTranscriptionUseCase(repository, speech_to_text_service, voice_lookup)


def provide_get_transcription_use_case(repository: TranscriptionRepositoryDep) -> GetTranscriptionUseCase:
    return GetTranscriptionUseCase(repository)


def provide_get_transcription_by_recording_use_case(
    repository: TranscriptionRepositoryDep,
) -> GetTranscriptionByRecordingUseCase:
    return GetTranscriptionByRecordingUseCase(repository)


def provide_list_transcriptions_use_case(repository: TranscriptionRepositoryDep) -> ListTranscriptionsUseCase:
    return ListTranscriptionsUseCase(repository)


def provide_update_transcription_use_case(repository: TranscriptionRepositoryDep) -> UpdateTranscriptionUseCase:
    return UpdateTranscriptionUseCase(repository)


def provide_delete_transcription_use_case(
    repository: TranscriptionRepositoryDep,
    storage_service: AudioStorageServiceDep,
) -> DeleteTranscriptionUseCase:
    return DeleteTranscriptionUseCase(repository, storage_service)


def provide_retry_transcription_use_case(
    start_use_case: StartTranscriptionUseCaseDep,
    repository: TranscriptionRepositoryDep,
) -> RetryTranscriptionUseCase:
    return RetryTranscriptionUseCase(start_use_case, repository)


UploadTranscriptionUseCaseDep = Annotated[UploadTranscriptionUseCase, Depends(provide_upload_transcription_use_case)]
StartTranscriptionUseCaseDep = Annotated[StartTranscriptionUseCase, Depends(provide_start_transcription_use_case)]
GetTranscriptionUseCaseDep = Annotated[GetTranscriptionUseCase, Depends(provide_get_transcription_use_case)]
GetTranscriptionByRecordingUseCaseDep = Annotated[
    GetTranscriptionByRecordingUseCase, Depends(provide_get_transcription_by_recording_use_case)
]
ListTranscriptionsUseCaseDep = Annotated[ListTranscriptionsUseCase, Depends(provide_list_transcriptions_use_case)]
UpdateTranscriptionUseCaseDep = Annotated[UpdateTranscriptionUseCase, Depends(provide_update_transcription_use_case)]
DeleteTranscriptionUseCaseDep = Annotated[DeleteTranscriptionUseCase, Depends(provide_delete_transcription_use_case)]
RetryTranscriptionUseCaseDep = Annotated[RetryTranscriptionUseCase, Depends(provide_retry_transcription_use_case)]

RequireTranscriptionsRead = Annotated[User, Depends(require_permission("transcriptions:read"))]
RequireTranscriptionsCreate = Annotated[User, Depends(require_permission("transcriptions:create"))]
RequireTranscriptionsUpdate = Annotated[User, Depends(require_permission("transcriptions:update"))]
RequireTranscriptionsDelete = Annotated[User, Depends(require_permission("transcriptions:delete"))]
