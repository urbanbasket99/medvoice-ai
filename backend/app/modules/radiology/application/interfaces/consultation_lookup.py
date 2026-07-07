from abc import ABC, abstractmethod
from uuid import UUID

from app.modules.radiology.application.dto.radiology_order_dto import ConsultationContext


class ConsultationLookup(ABC):
    @abstractmethod
    async def get_consultation_context(self, consultation_id: UUID) -> ConsultationContext | None:
        """Resolve patient and doctor from a consultation."""
