from abc import ABC, abstractmethod
from uuid import UUID

from app.modules.prescriptions.domain.entities.prescription import Prescription
from app.modules.prescriptions.domain.value_objects import PrescriptionListCriteria, PrescriptionPage


class PrescriptionRepository(ABC):
    @abstractmethod
    async def get_by_id(self, prescription_id: UUID) -> Prescription | None:
        raise NotImplementedError

    @abstractmethod
    async def create(self, prescription: Prescription) -> Prescription:
        raise NotImplementedError

    @abstractmethod
    async def update(self, prescription: Prescription) -> Prescription:
        raise NotImplementedError

    @abstractmethod
    async def soft_delete(self, prescription_id: UUID) -> bool:
        raise NotImplementedError

    @abstractmethod
    async def list_prescriptions(self, criteria: PrescriptionListCriteria) -> PrescriptionPage:
        raise NotImplementedError

    @abstractmethod
    async def search_prescriptions(self, query: str, page: int, page_size: int) -> PrescriptionPage:
        raise NotImplementedError
