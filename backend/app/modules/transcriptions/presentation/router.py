from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, File, Form, Query, UploadFile, status

from app.modules.transcriptions.application.dto.transcription_dto import UploadTranscriptionInput
from app.modules.transcriptions.domain.entities.transcription import TranscriptionListCriteria
from app.modules.transcriptions.domain.value_objects import TranscriptionStatus
from app.modules.transcriptions.infrastructure.background import run_transcription_processing
from app.modules.transcriptions.presentation.dependencies import (
    DeleteTranscriptionUseCaseDep,
    GetTranscriptionByRecordingUseCaseDep,
    GetTranscriptionUseCaseDep,
    ListTranscriptionsUseCaseDep,
    RequireTranscriptionsCreate,
    RequireTranscriptionsDelete,
    RequireTranscriptionsRead,
    RequireTranscriptionsUpdate,
    RetryTranscriptionUseCaseDep,
    StartTranscriptionUseCaseDep,
    UpdateTranscriptionUseCaseDep,
    UploadTranscriptionUseCaseDep,
)
from app.modules.transcriptions.presentation.schemas import (
    StartTranscriptionRequest,
    TranscriptionListResponse,
    TranscriptionResponse,
    UpdateTranscriptionRequest,
)

router = APIRouter(prefix="/transcriptions", tags=["transcriptions"])


@router.get("", response_model=TranscriptionListResponse)
async def list_transcriptions(
    _: RequireTranscriptionsRead,
    use_case: ListTranscriptionsUseCaseDep,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    consultation_id: UUID | None = None,
    patient_id: UUID | None = None,
    doctor_id: UUID | None = None,
    status_filter: Annotated[TranscriptionStatus | None, Query(alias="status")] = None,
) -> TranscriptionListResponse:
    criteria = TranscriptionListCriteria(
        page=page,
        page_size=page_size,
        consultation_id=consultation_id,
        patient_id=patient_id,
        doctor_id=doctor_id,
        status=status_filter,
    )
    result = await use_case.execute(criteria)
    return TranscriptionListResponse.from_page(result)


@router.post("/upload", response_model=TranscriptionResponse, status_code=status.HTTP_201_CREATED)
async def upload_transcription_audio(
    _: RequireTranscriptionsCreate,
    use_case: UploadTranscriptionUseCaseDep,
    consultation_id: Annotated[UUID, Form()],
    file: UploadFile = File(...),
    language: Annotated[str | None, Form()] = None,
    recording_id: Annotated[UUID | None, Form()] = None,
) -> TranscriptionResponse:
    content = await file.read()
    transcription = await use_case.execute(
        UploadTranscriptionInput(
            consultation_id=consultation_id,
            file_name=file.filename or "audio.webm",
            content=content,
            content_type=file.content_type,
            language=language,
            recording_id=recording_id,
        )
    )
    return TranscriptionResponse.from_entity(transcription)


@router.post("/start", response_model=TranscriptionResponse)
async def start_transcription(
    payload: StartTranscriptionRequest,
    background_tasks: BackgroundTasks,
    _: RequireTranscriptionsCreate,
    use_case: StartTranscriptionUseCaseDep,
) -> TranscriptionResponse:
    transcription = await use_case.start_processing(payload.to_input())
    if transcription.status == TranscriptionStatus.PROCESSING:
        background_tasks.add_task(
            run_transcription_processing,
            transcription.id,
            payload.language,
        )
    return TranscriptionResponse.from_entity(transcription)


@router.get("/{transcription_id}", response_model=TranscriptionResponse)
async def get_transcription(
    transcription_id: UUID,
    _: RequireTranscriptionsRead,
    use_case: GetTranscriptionUseCaseDep,
) -> TranscriptionResponse:
    transcription = await use_case.execute(transcription_id)
    return TranscriptionResponse.from_entity(transcription)


@router.get("/by-recording/{recording_id}", response_model=TranscriptionResponse)
async def get_transcription_by_recording(
    recording_id: UUID,
    _: RequireTranscriptionsRead,
    use_case: GetTranscriptionByRecordingUseCaseDep,
) -> TranscriptionResponse:
    transcription = await use_case.execute(recording_id)
    return TranscriptionResponse.from_entity(transcription)


@router.put("/{transcription_id}", response_model=TranscriptionResponse)
async def update_transcription(
    transcription_id: UUID,
    payload: UpdateTranscriptionRequest,
    _: RequireTranscriptionsUpdate,
    use_case: UpdateTranscriptionUseCaseDep,
) -> TranscriptionResponse:
    transcription = await use_case.execute(transcription_id, payload.to_input())
    return TranscriptionResponse.from_entity(transcription)


@router.post("/{transcription_id}/retry", response_model=TranscriptionResponse)
async def retry_transcription(
    transcription_id: UUID,
    background_tasks: BackgroundTasks,
    _: RequireTranscriptionsCreate,
    use_case: RetryTranscriptionUseCaseDep,
) -> TranscriptionResponse:
    transcription = await use_case.execute(transcription_id)
    if transcription.status == TranscriptionStatus.PROCESSING:
        background_tasks.add_task(
            run_transcription_processing,
            transcription.id,
            transcription.language,
        )
    return TranscriptionResponse.from_entity(transcription)


@router.delete("/{transcription_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transcription(
    transcription_id: UUID,
    _: RequireTranscriptionsDelete,
    use_case: DeleteTranscriptionUseCaseDep,
) -> None:
    await use_case.execute(transcription_id)
