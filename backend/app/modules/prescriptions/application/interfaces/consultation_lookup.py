from abc import ABC, abstractmethod
from uuid import UUID

from app.modules.prescriptions.application.dto.prescription_dto import ConsultationContext


class ConsultationLookup(ABC):
    @abstractmethod
    async def get_consultation_context(self, consultation_id: UUID) -> ConsultationContext | None:
        """Resolve patient and doctor from a consultation."""
