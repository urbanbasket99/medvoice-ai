from uuid import UUID

from app.modules.billing.application.dto.billing_dto import InvoiceItemSuggestion
from app.modules.billing.application.interfaces.consultation_charge_lookup import ConsultationChargeLookup


class GetConsultationChargesUseCase:
    def __init__(self, charge_lookup: ConsultationChargeLookup) -> None:
        self._charge_lookup = charge_lookup

    async def execute(self, consultation_id: UUID) -> list[InvoiceItemSuggestion]:
        return await self._charge_lookup.get_suggested_items(consultation_id)
