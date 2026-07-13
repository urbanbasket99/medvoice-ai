from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, status

from app.modules.ipd.domain.value_objects import BedListCriteria, BedSortField, BedStatus, SortDirection
from app.modules.ipd.presentation.dependencies import (
    CreateBedUseCaseDep,
    DeleteBedUseCaseDep,
    GetBedUseCaseDep,
    GetBedsUseCaseDep,
    ListAvailableBedsUseCaseDep,
    RequireIpdCreate,
    RequireIpdDelete,
    RequireIpdRead,
    RequireIpdUpdate,
    UpdateBedUseCaseDep,
)
from app.modules.ipd.presentation.schemas import (
    BedCreateRequest,
    BedListResponse,
    BedResponse,
    BedUpdateRequest,
)

router = APIRouter(prefix="/ipd/beds", tags=["ipd"])


@router.get("", response_model=BedListResponse)
async def list_beds(
    _: RequireIpdRead,
    use_case: GetBedsUseCaseDep,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=500)] = 20,
    sort_by: BedSortField = BedSortField.CREATED_AT,
    sort_dir: SortDirection = SortDirection.DESC,
    ward_id: UUID | None = None,
    status_filter: BedStatus | None = Query(default=None, alias="status"),
    search: str | None = Query(default=None, max_length=100),
) -> BedListResponse:
    criteria = BedListCriteria(
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_dir=sort_dir,
        ward_id=ward_id,
        status=status_filter,
        search=search,
    )
    result = await use_case.execute(criteria)
    return BedListResponse.from_page(result)


@router.get("/available", response_model=list[BedResponse])
async def list_available_beds(
    _: RequireIpdRead,
    use_case: ListAvailableBedsUseCaseDep,
    ward_id: UUID | None = None,
) -> list[BedResponse]:
    beds = await use_case.execute(ward_id)
    return [BedResponse.from_entity(bed) for bed in beds]


@router.get("/{bed_id}", response_model=BedResponse)
async def get_bed(
    bed_id: UUID,
    _: RequireIpdRead,
    use_case: GetBedUseCaseDep,
) -> BedResponse:
    bed = await use_case.execute(bed_id)
    return BedResponse.from_entity(bed)


@router.post("", response_model=BedResponse, status_code=status.HTTP_201_CREATED)
async def create_bed(
    payload: BedCreateRequest,
    _: RequireIpdCreate,
    use_case: CreateBedUseCaseDep,
) -> BedResponse:
    bed = await use_case.execute(payload.to_input())
    return BedResponse.from_entity(bed)


@router.put("/{bed_id}", response_model=BedResponse)
async def update_bed(
    bed_id: UUID,
    payload: BedUpdateRequest,
    _: RequireIpdUpdate,
    use_case: UpdateBedUseCaseDep,
) -> BedResponse:
    bed = await use_case.execute(bed_id, payload.to_input())
    return BedResponse.from_entity(bed)


@router.delete("/{bed_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bed(
    bed_id: UUID,
    _: RequireIpdDelete,
    use_case: DeleteBedUseCaseDep,
) -> None:
    await use_case.execute(bed_id)
