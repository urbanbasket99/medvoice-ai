from typing import Annotated

from fastapi import Depends

from app.api.deps import DbSession, require_permission
from app.domain.entities.user import User
from app.modules.voice.application.use_cases.delete_recording import DeleteRecordingUseCase
from app.modules.voice.application.use_cases.get_recording import GetRecordingUseCase
from app.modules.voice.application.use_cases.get_recordings import GetRecordingsUseCase
from app.modules.voice.application.use_cases.start_recording import StartRecordingUseCase
from app.modules.voice.application.use_cases.stop_recording import StopRecordingUseCase
from app.modules.voice.application.use_cases.upload_recording import UploadRecordingUseCase
from app.modules.voice.domain.repositories.voice_recording_repository import VoiceRecordingRepository
from app.modules.voice.infrastructure.file_storage import VoiceFileStorage
from app.modules.voice.infrastructure.repositories.sqlalchemy_voice_recording_repository import (
    SqlAlchemyVoiceRecordingRepository,
)


def get_voice_recording_repository(db: DbSession) -> VoiceRecordingRepository:
    return SqlAlchemyVoiceRecordingRepository(db)


def get_voice_file_storage() -> VoiceFileStorage:
    return VoiceFileStorage()


VoiceRecordingRepositoryDep = Annotated[VoiceRecordingRepository, Depends(get_voice_recording_repository)]
VoiceFileStorageDep = Annotated[VoiceFileStorage, Depends(get_voice_file_storage)]


def provide_start_recording_use_case(repository: VoiceRecordingRepositoryDep) -> StartRecordingUseCase:
    return StartRecordingUseCase(repository)


def provide_stop_recording_use_case(repository: VoiceRecordingRepositoryDep) -> StopRecordingUseCase:
    return StopRecordingUseCase(repository)


def provide_upload_recording_use_case(repository: VoiceRecordingRepositoryDep) -> UploadRecordingUseCase:
    return UploadRecordingUseCase(repository)


def provide_get_recording_use_case(repository: VoiceRecordingRepositoryDep) -> GetRecordingUseCase:
    return GetRecordingUseCase(repository)


def provide_get_recordings_use_case(repository: VoiceRecordingRepositoryDep) -> GetRecordingsUseCase:
    return GetRecordingsUseCase(repository)


def provide_delete_recording_use_case(repository: VoiceRecordingRepositoryDep) -> DeleteRecordingUseCase:
    return DeleteRecordingUseCase(repository)


StartRecordingUseCaseDep = Annotated[StartRecordingUseCase, Depends(provide_start_recording_use_case)]
StopRecordingUseCaseDep = Annotated[StopRecordingUseCase, Depends(provide_stop_recording_use_case)]
UploadRecordingUseCaseDep = Annotated[UploadRecordingUseCase, Depends(provide_upload_recording_use_case)]
GetRecordingUseCaseDep = Annotated[GetRecordingUseCase, Depends(provide_get_recording_use_case)]
GetRecordingsUseCaseDep = Annotated[GetRecordingsUseCase, Depends(provide_get_recordings_use_case)]
DeleteRecordingUseCaseDep = Annotated[DeleteRecordingUseCase, Depends(provide_delete_recording_use_case)]

RequireVoiceRecord = Annotated[User, Depends(require_permission("voice:record"))]
RequireVoiceRead = Annotated[User, Depends(require_permission("voice:read"))]
RequireVoiceDelete = Annotated[User, Depends(require_permission("voice:delete"))]
