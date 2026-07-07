from datetime import date
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, status

from app.modules.consultations.application.dto.consultation_dto import (
    CreateConsultationInput,
    UpdateConsultationInput,
)
from app.modules.consultations.domain.entities.consultation import ConsultationStatus
from app.modules.consultations.domain.value_objects import ConsultationListCriteria, ConsultationSortField, SortDirection
from app.modules.consultations.presentation.dependencies import (
    CreateConsultationUseCaseDep,
    DeleteConsultationUseCaseDep,
    GetConsultationUseCaseDep,
    GetConsultationsUseCaseDep,
    RequireConsultationsCreate,
    RequireConsultationsDelete,
    RequireConsultationsRead,
    RequireConsultationsUpdate,
    SearchConsultationsUseCaseDep,
    UpdateConsultationUseCaseDep,
)
from app.modules.consultations.presentation.schemas import (
    ConsultationCreateRequest,
    ConsultationListResponse,
    ConsultationResponse,
    ConsultationUpdateRequest,
)

router = APIRouter(prefix="/consultations", tags=["consultations"])


def _to_create_input(payload: ConsultationCreateRequest) -> CreateConsultationInput:
    return CreateConsultationInput(appointment_id=payload.appointment_id)


def _to_update_input(payload: ConsultationUpdateRequest) -> UpdateConsultationInput:
    vital_signs = payload.vital_signs.to_entity() if payload.vital_signs is not None else None
    return UpdateConsultationInput(
        chief_complaint=payload.chief_complaint,
        history_of_present_illness=payload.history_of_present_illness,
        past_medical_history=payload.past_medical_history,
        family_history=payload.family_history,
        allergies=payload.allergies,
        current_medications=payload.current_medications,
        vital_signs=vital_signs,
        physical_examination=payload.physical_examination,
        diagnosis=payload.diagnosis,
        assessment=payload.assessment,
        treatment_plan=payload.treatment_plan,
        doctor_notes=payload.doctor_notes,
        follow_up_date=payload.follow_up_date,
        status=payload.status,
    )


@router.get("", response_model=ConsultationListResponse)
async def list_consultations(
    _: RequireConsultationsRead,
    use_case: GetConsultationsUseCaseDep,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=500)] = 20,
    sort_by: ConsultationSortField = ConsultationSortField.CREATED_AT,
    sort_dir: SortDirection = SortDirection.DESC,
    status_filter: Annotated[ConsultationStatus | None, Query(alias="status")] = None,
    patient_id: UUID | None = None,
    doctor_id: UUID | None = None,
    appointment_id: UUID | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
) -> ConsultationListResponse:
    criteria = ConsultationListCriteria(
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_dir=sort_dir,
        status=status_filter,
        patient_id=patient_id,
        doctor_id=doctor_id,
        appointment_id=appointment_id,
        date_from=date_from,
        date_to=date_to,
    )
    result = await use_case.execute(criteria)
    return ConsultationListResponse.from_page(result)


@router.get("/search", response_model=ConsultationListResponse)
async def search_consultations(
    _: RequireConsultationsRead,
    use_case: SearchConsultationsUseCaseDep,
    q: Annotated[str, Query(min_length=1, max_length=100)],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=500)] = 20,
) -> ConsultationListResponse:
    result = await use_case.execute(q, page, page_size)
    return ConsultationListResponse.from_page(result)


@router.get("/{consultation_id}", response_model=ConsultationResponse)
async def get_consultation(
    consultation_id: UUID,
    _: RequireConsultationsRead,
    use_case: GetConsultationUseCaseDep,
) -> ConsultationResponse:
    consultation = await use_case.execute(consultation_id)
    return ConsultationResponse.from_entity(consultation)


@router.post("", response_model=ConsultationResponse, status_code=status.HTTP_201_CREATED)
async def create_consultation(
    payload: ConsultationCreateRequest,
    _: RequireConsultationsCreate,
    use_case: CreateConsultationUseCaseDep,
) -> ConsultationResponse:
    consultation = await use_case.execute(_to_create_input(payload))
    return ConsultationResponse.from_entity(consultation)


@router.put("/{consultation_id}", response_model=ConsultationResponse)
async def update_consultation(
    consultation_id: UUID,
    payload: ConsultationUpdateRequest,
    _: RequireConsultationsUpdate,
    use_case: UpdateConsultationUseCaseDep,
) -> ConsultationResponse:
    consultation = await use_case.execute(consultation_id, _to_update_input(payload))
    return ConsultationResponse.from_entity(consultation)


@router.delete("/{consultation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_consultation(
    consultation_id: UUID,
    _: RequireConsultationsDelete,
    use_case: DeleteConsultationUseCaseDep,
) -> None:
    await use_case.execute(consultation_id)
