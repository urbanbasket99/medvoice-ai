import multipart
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, File, Form, Query, UploadFile, status
from fastapi.responses import FileResponse

from app.core.config import get_settings
from app.modules.voice.application.dto.voice_dto import (
    StartRecordingInput,
    StopRecordingInput,
    UploadRecordingInput,
)
from app.modules.voice.domain.entities.voice_recording import RecordingStatus
from app.modules.voice.domain.exceptions import VoiceRecordingNotFoundError, VoiceRecordingUploadError
from app.modules.voice.domain.value_objects import SortDirection, VoiceRecordingListCriteria, VoiceRecordingSortField
from app.modules.voice.presentation.dependencies import (
    DeleteRecordingUseCaseDep,
    GetRecordingUseCaseDep,
    GetRecordingsUseCaseDep,
    RequireVoiceDelete,
    RequireVoiceRead,
    RequireVoiceRecord,
    StartRecordingUseCaseDep,
    StopRecordingUseCaseDep,
    UploadRecordingUseCaseDep,
    VoiceFileStorageDep,
)
from app.modules.voice.presentation.schemas import (
    StartRecordingRequest,
    StopRecordingRequest,
    VoiceRecordingListResponse,
    VoiceRecordingResponse,
)

router = APIRouter(prefix="/voice", tags=["voice"])


@router.get("", response_model=VoiceRecordingListResponse)
async def list_recordings(
    _: RequireVoiceRead,
    use_case: GetRecordingsUseCaseDep,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    sort_by: VoiceRecordingSortField = VoiceRecordingSortField.CREATED_AT,
    sort_dir: SortDirection = SortDirection.DESC,
    consultation_id: UUID | None = None,
    patient_id: UUID | None = None,
    doctor_id: UUID | None = None,
    status_filter: Annotated[RecordingStatus | None, Query(alias="status")] = None,
) -> VoiceRecordingListResponse:
    criteria = VoiceRecordingListCriteria(
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_dir=sort_dir,
        consultation_id=consultation_id,
        patient_id=patient_id,
        doctor_id=doctor_id,
        status=status_filter,
    )
    result = await use_case.execute(criteria)
    return VoiceRecordingListResponse.from_page(result)


@router.post("/start", response_model=VoiceRecordingResponse, status_code=status.HTTP_201_CREATED)
async def start_recording(
    payload: StartRecordingRequest,
    _: RequireVoiceRecord,
    use_case: StartRecordingUseCaseDep,
) -> VoiceRecordingResponse:
    recording = await use_case.execute(StartRecordingInput(consultation_id=payload.consultation_id))
    return VoiceRecordingResponse.from_entity(recording)


@router.post("/stop", response_model=VoiceRecordingResponse)
async def stop_recording(
    payload: StopRecordingRequest,
    _: RequireVoiceRecord,
    use_case: StopRecordingUseCaseDep,
) -> VoiceRecordingResponse:
    recording = await use_case.execute(
        StopRecordingInput(recording_id=payload.recording_id, duration_seconds=payload.duration_seconds)
    )
    return VoiceRecordingResponse.from_entity(recording)


@router.post("/upload", response_model=VoiceRecordingResponse)
async def upload_recording(
    _: RequireVoiceRecord,
    use_case: UploadRecordingUseCaseDep,
    get_use_case: GetRecordingUseCaseDep,
    storage: VoiceFileStorageDep,
    recording_id: Annotated[UUID, Form()],
    duration_seconds: Annotated[float | None, Form()] = None,
    file: UploadFile = File(...),
) -> VoiceRecordingResponse:
    settings = get_settings()
    content = await file.read()
    max_bytes = settings.max_voice_recording_size_mb * 1024 * 1024
    if len(content) > max_bytes:
        raise VoiceRecordingUploadError(
            f"Recording exceeds maximum size of {settings.max_voice_recording_size_mb} MB."
        )

    file_name = file.filename or "recording.webm"
    audio_format = file.content_type or "audio/webm"
    storage_path, file_size = await storage.save(recording_id, file_name, content)

    recording = await use_case.execute(
        UploadRecordingInput(
            recording_id=recording_id,
            file_name=file_name,
            storage_path=storage_path,
            file_size_bytes=file_size,
            audio_format=audio_format,
            duration_seconds=duration_seconds,
        )
    )
    return VoiceRecordingResponse.from_entity(recording)


@router.get("/{recording_id}", response_model=VoiceRecordingResponse)
async def get_recording(
    recording_id: UUID,
    _: RequireVoiceRead,
    use_case: GetRecordingUseCaseDep,
) -> VoiceRecordingResponse:
    recording = await use_case.execute(recording_id)
    return VoiceRecordingResponse.from_entity(recording)


@router.get("/{recording_id}/download")
async def download_recording(
    recording_id: UUID,
    _: RequireVoiceRead,
    use_case: GetRecordingUseCaseDep,
    storage: VoiceFileStorageDep,
) -> FileResponse:
    recording = await use_case.execute(recording_id)
    if not recording.storage_path or recording.status != RecordingStatus.COMPLETED:
        raise VoiceRecordingNotFoundError("Recording file is not available for download.")

    path = storage.resolve(recording.storage_path)
    media_type = recording.audio_format or "audio/webm"
    filename = recording.file_name or f"{recording_id}.webm"
    return FileResponse(path, media_type=media_type, filename=filename)


@router.delete("/{recording_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_recording(
    recording_id: UUID,
    _: RequireVoiceDelete,
    delete_use_case: DeleteRecordingUseCaseDep,
    get_use_case: GetRecordingUseCaseDep,
    storage: VoiceFileStorageDep,
) -> None:
    recording = await get_use_case.execute(recording_id)
    if recording.storage_path:
        try:
            storage.delete(recording.storage_path)
        except OSError:
            pass
    await delete_use_case.execute(recording_id)
