from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query

from app.modules.pharmacy.domain.value_objects import InventoryListCriteria, SortDirection, StockMovementListCriteria, StockMovementType
from app.modules.pharmacy.presentation.dependencies import (
    AdjustStockUseCaseDep,
    GetInventoryUseCaseDep,
    GetLowStockUseCaseDep,
    GetStockByMedicineUseCaseDep,
    GetStockHistoryUseCaseDep,
    RequirePharmacyRead,
    RequirePharmacyUpdate,
)
from app.modules.pharmacy.presentation.schemas import (
    AdjustStockRequest,
    AdjustStockResponse,
    InventoryListResponse,
    StockMovementListResponse,
    StockMovementResponse,
    StockResponse,
)

router = APIRouter(prefix="/pharmacy/stock", tags=["pharmacy"])


@router.get("", response_model=InventoryListResponse)
async def get_inventory(
    _: RequirePharmacyRead,
    use_case: GetInventoryUseCaseDep,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=500)] = 20,
    sort_dir: SortDirection = SortDirection.ASC,
) -> InventoryListResponse:
    criteria = InventoryListCriteria(page=page, page_size=page_size, sort_dir=sort_dir)
    result = await use_case.execute(criteria)
    return InventoryListResponse.from_page(result)


@router.get("/low", response_model=list[StockResponse])
async def get_low_stock(
    _: RequirePharmacyRead,
    use_case: GetLowStockUseCaseDep,
) -> list[StockResponse]:
    items = await use_case.execute()
    return [StockResponse.from_entity(s) for s in items]


@router.get("/medicine/{medicine_id}", response_model=StockResponse)
async def get_stock_by_medicine(
    medicine_id: UUID,
    _: RequirePharmacyRead,
    use_case: GetStockByMedicineUseCaseDep,
) -> StockResponse:
    stock = await use_case.execute(medicine_id)
    return StockResponse.from_entity(stock)


@router.post("/adjust", response_model=AdjustStockResponse)
async def adjust_stock(
    payload: AdjustStockRequest,
    user: RequirePharmacyUpdate,
    use_case: AdjustStockUseCaseDep,
) -> AdjustStockResponse:
    stock, movement = await use_case.execute(payload.to_input(), created_by=user.id)
    return AdjustStockResponse(
        stock=StockResponse.from_entity(stock),
        movement=StockMovementResponse.from_entity(movement),
    )


@router.get("/history", response_model=StockMovementListResponse)
async def get_stock_history(
    _: RequirePharmacyRead,
    use_case: GetStockHistoryUseCaseDep,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=500)] = 20,
    medicine_id: UUID | None = None,
    movement_type: StockMovementType | None = None,
) -> StockMovementListResponse:
    criteria = StockMovementListCriteria(
        page=page,
        page_size=page_size,
        medicine_id=medicine_id,
        movement_type=movement_type,
    )
    result = await use_case.execute(criteria)
    return StockMovementListResponse.from_page(result)
