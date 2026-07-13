from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, status

from app.modules.ipd.domain.value_objects import SortDirection, WardListCriteria, WardSortField, WardType
from app.modules.ipd.presentation.dependencies import (
    CreateWardUseCaseDep,
    DeleteWardUseCaseDep,
    GetWardUseCaseDep,
    GetWardsUseCaseDep,
    RequireIpdCreate,
    RequireIpdDelete,
    RequireIpdRead,
    RequireIpdUpdate,
    UpdateWardUseCaseDep,
)
from app.modules.ipd.presentation.schemas import (
    WardCreateRequest,
    WardListResponse,
    WardResponse,
    WardUpdateRequest,
)

router = APIRouter(prefix="/ipd/wards", tags=["ipd"])


@router.get("", response_model=WardListResponse)
async def list_wards(
    _: RequireIpdRead,
    use_case: GetWardsUseCaseDep,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=500)] = 20,
    sort_by: WardSortField = WardSortField.CREATED_AT,
    sort_dir: SortDirection = SortDirection.DESC,
    ward_type: WardType | None = None,
    is_active: bool | None = None,
    search: str | None = Query(default=None, max_length=100),
) -> WardListResponse:
    criteria = WardListCriteria(
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_dir=sort_dir,
        ward_type=ward_type,
        is_active=is_active,
        search=search,
    )
    result = await use_case.execute(criteria)
    return WardListResponse.from_page(result)


@router.get("/{ward_id}", response_model=WardResponse)
async def get_ward(
    ward_id: UUID,
    _: RequireIpdRead,
    use_case: GetWardUseCaseDep,
) -> WardResponse:
    ward = await use_case.execute(ward_id)
    return WardResponse.from_entity(ward)


@router.post("", response_model=WardResponse, status_code=status.HTTP_201_CREATED)
async def create_ward(
    payload: WardCreateRequest,
    _: RequireIpdCreate,
    use_case: CreateWardUseCaseDep,
) -> WardResponse:
    ward = await use_case.execute(payload.to_input())
    return WardResponse.from_entity(ward)


@router.put("/{ward_id}", response_model=WardResponse)
async def update_ward(
    ward_id: UUID,
    payload: WardUpdateRequest,
    _: RequireIpdUpdate,
    use_case: UpdateWardUseCaseDep,
) -> WardResponse:
    ward = await use_case.execute(ward_id, payload.to_input())
    return WardResponse.from_entity(ward)


@router.delete("/{ward_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ward(
    ward_id: UUID,
    _: RequireIpdDelete,
    use_case: DeleteWardUseCaseDep,
) -> None:
    await use_case.execute(ward_id)
