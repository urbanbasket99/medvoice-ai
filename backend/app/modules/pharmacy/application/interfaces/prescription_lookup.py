from abc import ABC, abstractmethod
from uuid import UUID

from app.modules.pharmacy.application.dto.pharmacy_dto import PrescriptionContext


class PrescriptionLookup(ABC):
    @abstractmethod
    async def get_prescription_context(self, prescription_id: UUID) -> PrescriptionContext | None:
        """Resolve consultation, patient, doctor, and items from a prescription."""
        raise NotImplementedError
