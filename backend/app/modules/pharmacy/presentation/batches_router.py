from uuid import UUID

from fastapi import APIRouter, Query, status

from app.modules.pharmacy.presentation.dependencies import (
    CreateBatchUseCaseDep,
    ListBatchesByMedicineUseCaseDep,
    RequirePharmacyCreate,
    RequirePharmacyRead,
    RequirePharmacyUpdate,
    UpdateBatchUseCaseDep,
)
from app.modules.pharmacy.presentation.schemas import BatchCreateRequest, BatchResponse, BatchUpdateRequest

router = APIRouter(prefix="/pharmacy/batches", tags=["pharmacy"])


@router.get("", response_model=list[BatchResponse])
async def list_batches(
    _: RequirePharmacyRead,
    use_case: ListBatchesByMedicineUseCaseDep,
    medicine_id: UUID = Query(...),
) -> list[BatchResponse]:
    batches = await use_case.execute(medicine_id)
    return [BatchResponse.from_entity(b) for b in batches]


@router.post("", response_model=BatchResponse, status_code=status.HTTP_201_CREATED)
async def create_batch(
    payload: BatchCreateRequest,
    _: RequirePharmacyCreate,
    use_case: CreateBatchUseCaseDep,
) -> BatchResponse:
    batch = await use_case.execute(payload.to_input())
    return BatchResponse.from_entity(batch)


@router.put("/{batch_id}", response_model=BatchResponse)
async def update_batch(
    batch_id: UUID,
    payload: BatchUpdateRequest,
    _: RequirePharmacyUpdate,
    use_case: UpdateBatchUseCaseDep,
) -> BatchResponse:
    batch = await use_case.execute(batch_id, payload.to_input())
    return BatchResponse.from_entity(batch)
