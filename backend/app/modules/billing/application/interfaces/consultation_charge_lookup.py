from abc import ABC, abstractmethod
from uuid import UUID

from app.modules.billing.application.dto.billing_dto import InvoiceItemSuggestion


class ConsultationChargeLookup(ABC):
    @abstractmethod
    async def get_suggested_items(self, consultation_id: UUID) -> list[InvoiceItemSuggestion]:
        """Return suggested invoice line items from lab orders, radiology orders, and dispenses."""
