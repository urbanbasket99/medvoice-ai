from uuid import UUID

from fastapi import APIRouter, status

from app.modules.ipd.presentation.dependencies import (
    CreateAdmissionChargeUseCaseDep,
    CreateAdmissionFromConsultationUseCaseDep,
    CreateNursingNoteUseCaseDep,
    CreateOtScheduleUseCaseDep,
    DeleteNursingNoteUseCaseDep,
    GenerateAdmissionInvoiceUseCaseDep,
    GetMlcCaseUseCaseDep,
    ListAdmissionChargesUseCaseDep,
    ListNursingNotesUseCaseDep,
    ListOtSchedulesUseCaseDep,
    RequireIpdCreate,
    RequireIpdDelete,
    RequireIpdRead,
    RequireIpdUpdate,
    UpdateOtScheduleUseCaseDep,
    UpsertMlcCaseUseCaseDep,
)
from app.modules.ipd.presentation.schemas import AdmissionResponse
from app.modules.ipd.presentation.schemas_clinical import (
    AdmissionChargeCreateRequest,
    AdmissionChargeListResponse,
    AdmissionChargeResponse,
    AdmissionFromConsultationRequest,
    GenerateAdmissionInvoiceRequest,
    GenerateAdmissionInvoiceResponse,
    MlcCaseResponse,
    MlcCaseUpsertRequest,
    NursingNoteCreateRequest,
    NursingNoteListResponse,
    NursingNoteResponse,
    OtScheduleCreateRequest,
    OtScheduleListResponse,
    OtScheduleResponse,
    OtScheduleUpdateRequest,
)

router = APIRouter(prefix="/ipd/admissions", tags=["ipd"])


@router.post("/from-consultation", response_model=AdmissionResponse, status_code=status.HTTP_201_CREATED)
async def create_admission_from_consultation(
    payload: AdmissionFromConsultationRequest,
    _: RequireIpdCreate,
    use_case: CreateAdmissionFromConsultationUseCaseDep,
) -> AdmissionResponse:
    admission = await use_case.execute(payload.to_input())
    return AdmissionResponse.from_entity(admission)


@router.get("/{admission_id}/nursing-notes", response_model=NursingNoteListResponse)
async def list_nursing_notes(
    admission_id: UUID,
    _: RequireIpdRead,
    use_case: ListNursingNotesUseCaseDep,
) -> NursingNoteListResponse:
    notes = await use_case.execute(admission_id)
    return NursingNoteListResponse.from_entities(notes)


@router.post(
    "/{admission_id}/nursing-notes",
    response_model=NursingNoteResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_nursing_note(
    admission_id: UUID,
    payload: NursingNoteCreateRequest,
    current_user: RequireIpdCreate,
    use_case: CreateNursingNoteUseCaseDep,
) -> NursingNoteResponse:
    note = await use_case.execute(payload.to_input(admission_id, current_user.id))
    return NursingNoteResponse.from_entity(note)


@router.delete("/{admission_id}/nursing-notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_nursing_note(
    admission_id: UUID,
    note_id: UUID,
    _: RequireIpdDelete,
    use_case: DeleteNursingNoteUseCaseDep,
) -> None:
    await use_case.execute(note_id)


@router.get("/{admission_id}/ot-schedules", response_model=OtScheduleListResponse)
async def list_ot_schedules(
    admission_id: UUID,
    _: RequireIpdRead,
    use_case: ListOtSchedulesUseCaseDep,
) -> OtScheduleListResponse:
    schedules = await use_case.execute(admission_id)
    return OtScheduleListResponse.from_entities(schedules)


@router.post(
    "/{admission_id}/ot-schedules",
    response_model=OtScheduleResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_ot_schedule(
    admission_id: UUID,
    payload: OtScheduleCreateRequest,
    _: RequireIpdCreate,
    use_case: CreateOtScheduleUseCaseDep,
) -> OtScheduleResponse:
    schedule = await use_case.execute(payload.to_input(admission_id))
    return OtScheduleResponse.from_entity(schedule)


@router.put("/{admission_id}/ot-schedules/{schedule_id}", response_model=OtScheduleResponse)
async def update_ot_schedule(
    admission_id: UUID,
    schedule_id: UUID,
    payload: OtScheduleUpdateRequest,
    _: RequireIpdUpdate,
    use_case: UpdateOtScheduleUseCaseDep,
) -> OtScheduleResponse:
    schedule = await use_case.execute(schedule_id, payload.to_input())
    return OtScheduleResponse.from_entity(schedule)


@router.get("/{admission_id}/mlc", response_model=MlcCaseResponse | None)
async def get_mlc_case(
    admission_id: UUID,
    _: RequireIpdRead,
    use_case: GetMlcCaseUseCaseDep,
) -> MlcCaseResponse | None:
    mlc_case = await use_case.execute(admission_id)
    return MlcCaseResponse.from_entity(mlc_case) if mlc_case else None


@router.put("/{admission_id}/mlc", response_model=MlcCaseResponse)
async def upsert_mlc_case(
    admission_id: UUID,
    payload: MlcCaseUpsertRequest,
    _: RequireIpdUpdate,
    use_case: UpsertMlcCaseUseCaseDep,
) -> MlcCaseResponse:
    mlc_case = await use_case.execute(payload.to_input(admission_id))
    return MlcCaseResponse.from_entity(mlc_case)


@router.get("/{admission_id}/charges", response_model=AdmissionChargeListResponse)
async def list_admission_charges(
    admission_id: UUID,
    _: RequireIpdRead,
    use_case: ListAdmissionChargesUseCaseDep,
) -> AdmissionChargeListResponse:
    charges = await use_case.execute(admission_id)
    return AdmissionChargeListResponse.from_entities(charges)


@router.post(
    "/{admission_id}/charges",
    response_model=AdmissionChargeResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_admission_charge(
    admission_id: UUID,
    payload: AdmissionChargeCreateRequest,
    _: RequireIpdCreate,
    use_case: CreateAdmissionChargeUseCaseDep,
) -> AdmissionChargeResponse:
    charge = await use_case.execute(payload.to_input(admission_id))
    return AdmissionChargeResponse.from_entity(charge)


@router.post(
    "/{admission_id}/generate-invoice",
    response_model=GenerateAdmissionInvoiceResponse,
    status_code=status.HTTP_201_CREATED,
)
async def generate_admission_invoice(
    admission_id: UUID,
    payload: GenerateAdmissionInvoiceRequest,
    _: RequireIpdUpdate,
    use_case: GenerateAdmissionInvoiceUseCaseDep,
) -> GenerateAdmissionInvoiceResponse:
    invoice = await use_case.execute(payload.to_input(admission_id))
    return GenerateAdmissionInvoiceResponse.from_invoice(invoice)
