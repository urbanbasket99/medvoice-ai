from uuid import UUID

from fastapi import APIRouter

from app.modules.billing.presentation.dependencies import (
    RequireBillingUpdate,
    UpdateClaimUseCaseDep,
)
from app.modules.billing.presentation.schemas import ClaimUpdateRequest, InsuranceClaimResponse

router = APIRouter(prefix="/billing/claims", tags=["billing"])


@router.patch("/{claim_id}", response_model=InsuranceClaimResponse)
async def update_claim(
    claim_id: UUID,
    payload: ClaimUpdateRequest,
    _: RequireBillingUpdate,
    use_case: UpdateClaimUseCaseDep,
) -> InsuranceClaimResponse:
    claim = await use_case.execute(claim_id, payload.to_input())
    return InsuranceClaimResponse.from_entity(claim)
