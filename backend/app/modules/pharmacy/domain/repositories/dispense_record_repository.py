from abc import ABC, abstractmethod
from uuid import UUID

from app.modules.pharmacy.domain.entities.dispense_record import DispenseRecord
from app.modules.pharmacy.domain.value_objects import DispenseListCriteria, DispensePage, DispenseStatus


class DispenseRecordRepository(ABC):
    @abstractmethod
    async def get_by_id(self, dispense_id: UUID) -> DispenseRecord | None:
        raise NotImplementedError

    @abstractmethod
    async def create(self, dispense: DispenseRecord) -> DispenseRecord:
        raise NotImplementedError

    @abstractmethod
    async def update(self, dispense: DispenseRecord) -> DispenseRecord:
        raise NotImplementedError

    @abstractmethod
    async def update_status(
        self,
        dispense_id: UUID,
        status: DispenseStatus,
        notes: str | None = None,
        dispensed_by: UUID | None = None,
    ) -> DispenseRecord:
        raise NotImplementedError

    @abstractmethod
    async def soft_delete(self, dispense_id: UUID) -> bool:
        raise NotImplementedError

    @abstractmethod
    async def list_dispenses(self, criteria: DispenseListCriteria) -> DispensePage:
        raise NotImplementedError

    @abstractmethod
    async def search_dispenses(self, query: str, page: int, page_size: int) -> DispensePage:
        raise NotImplementedError

    @abstractmethod
    async def list_by_prescription(self, prescription_id: UUID) -> list[DispenseRecord]:
        raise NotImplementedError
