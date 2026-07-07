from typing import Annotated

from fastapi import APIRouter, Query

from app.modules.prescriptions.presentation.dependencies import (
    RequirePrescriptionsRead,
    SearchMedicinesUseCaseDep,
)
from app.modules.prescriptions.presentation.schemas import MedicineSearchResponse

router = APIRouter(prefix="/medicines", tags=["medicines"])


@router.get("/search", response_model=MedicineSearchResponse)
async def search_medicines(
    _: RequirePrescriptionsRead,
    use_case: SearchMedicinesUseCaseDep,
    q: Annotated[str, Query(min_length=1, max_length=100)],
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
) -> MedicineSearchResponse:
    medicines = await use_case.execute(q, limit)
    return MedicineSearchResponse.from_entities(medicines)
