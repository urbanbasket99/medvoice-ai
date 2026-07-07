from abc import ABC, abstractmethod
from uuid import UUID

from app.modules.pharmacy.domain.entities.pharmacy_batch import PharmacyBatch


class PharmacyBatchRepository(ABC):
    @abstractmethod
    async def get_by_id(self, batch_id: UUID) -> PharmacyBatch | None:
        raise NotImplementedError

    @abstractmethod
    async def create(self, batch: PharmacyBatch) -> PharmacyBatch:
        raise NotImplementedError

    @abstractmethod
    async def update(self, batch: PharmacyBatch) -> PharmacyBatch:
        raise NotImplementedError

    @abstractmethod
    async def list_by_medicine(self, medicine_id: UUID) -> list[PharmacyBatch]:
        raise NotImplementedError

    @abstractmethod
    async def decrement_quantity(self, batch_id: UUID, quantity: int) -> bool:
        raise NotImplementedError
