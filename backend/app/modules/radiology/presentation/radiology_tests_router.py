from typing import Annotated

from fastapi import APIRouter, Query

from app.modules.radiology.presentation.dependencies import (
    GetRadiologyTestsUseCaseDep,
    RequireRadiologyRead,
    SearchRadiologyTestsUseCaseDep,
)
from app.modules.radiology.presentation.schemas import RadiologyTestListResponse, RadiologyTestSearchResponse

router = APIRouter(prefix="/radiology-tests", tags=["radiology"])


@router.get("/search", response_model=RadiologyTestSearchResponse)
async def search_radiology_tests(
    _: RequireRadiologyRead,
    use_case: SearchRadiologyTestsUseCaseDep,
    q: Annotated[str, Query(min_length=1, max_length=100)],
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
) -> RadiologyTestSearchResponse:
    tests = await use_case.execute(q, limit)
    return RadiologyTestSearchResponse.from_entities(tests)


@router.get("", response_model=RadiologyTestListResponse)
async def list_radiology_tests(
    _: RequireRadiologyRead,
    use_case: GetRadiologyTestsUseCaseDep,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=500)] = 20,
) -> RadiologyTestListResponse:
    tests, total = await use_case.execute(page, page_size)
    return RadiologyTestListResponse.from_page(tests, total, page, page_size)
