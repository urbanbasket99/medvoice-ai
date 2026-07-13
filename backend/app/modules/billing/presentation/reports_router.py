from datetime import date

from fastapi import APIRouter, Query

from app.modules.billing.domain.value_objects import CollectionReportGroupBy
from app.modules.billing.presentation.dependencies import (
    GetCollectionReportUseCaseDep,
    RequireBillingRead,
)
from app.modules.billing.presentation.schemas import CollectionReportResponse

router = APIRouter(prefix="/billing/reports", tags=["billing"])


@router.get("/collections", response_model=CollectionReportResponse)
async def get_collection_report(
    _: RequireBillingRead,
    use_case: GetCollectionReportUseCaseDep,
    date_from: date = Query(...),
    date_to: date = Query(...),
    group_by: CollectionReportGroupBy = Query(CollectionReportGroupBy.DOCTOR),
) -> CollectionReportResponse:
    rows = await use_case.execute(date_from, date_to, group_by)
    return CollectionReportResponse.from_rows(group_by, date_from, date_to, rows)
