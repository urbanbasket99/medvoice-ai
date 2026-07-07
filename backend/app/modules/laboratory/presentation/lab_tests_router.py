from typing import Annotated

from fastapi import APIRouter, Query

from app.modules.laboratory.presentation.dependencies import (
    GetLabTestsUseCaseDep,
    RequireLaboratoryRead,
    SearchLabTestsUseCaseDep,
)
from app.modules.laboratory.presentation.schemas import LabTestListResponse, LabTestSearchResponse

router = APIRouter(prefix="/lab-tests", tags=["laboratory"])


@router.get("/search", response_model=LabTestSearchResponse)
async def search_lab_tests(
    _: RequireLaboratoryRead,
    use_case: SearchLabTestsUseCaseDep,
    q: Annotated[str, Query(min_length=1, max_length=100)],
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
) -> LabTestSearchResponse:
    tests = await use_case.execute(q, limit)
    return LabTestSearchResponse.from_entities(tests)


@router.get("", response_model=LabTestListResponse)
async def list_lab_tests(
    _: RequireLaboratoryRead,
    use_case: GetLabTestsUseCaseDep,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=500)] = 20,
) -> LabTestListResponse:
    tests, total = await use_case.execute(page, page_size)
    return LabTestListResponse.from_page(tests, total, page, page_size)
