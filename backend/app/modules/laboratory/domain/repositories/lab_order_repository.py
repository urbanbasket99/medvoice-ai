from abc import ABC, abstractmethod
from uuid import UUID

from app.modules.laboratory.domain.entities.lab_order import LabOrder
from app.modules.laboratory.domain.value_objects import LabOrderListCriteria, LabOrderPage, LabStatus


class LabOrderRepository(ABC):
    @abstractmethod
    async def get_by_id(self, lab_order_id: UUID) -> LabOrder | None:
        raise NotImplementedError

    @abstractmethod
    async def create(self, lab_order: LabOrder) -> LabOrder:
        raise NotImplementedError

    @abstractmethod
    async def update(self, lab_order: LabOrder) -> LabOrder:
        raise NotImplementedError

    @abstractmethod
    async def update_status(
        self,
        lab_order_id: UUID,
        status: LabStatus,
        notes: str | None = None,
    ) -> LabOrder:
        raise NotImplementedError

    @abstractmethod
    async def soft_delete(self, lab_order_id: UUID) -> bool:
        raise NotImplementedError

    @abstractmethod
    async def list_lab_orders(self, criteria: LabOrderListCriteria) -> LabOrderPage:
        raise NotImplementedError

    @abstractmethod
    async def search_lab_orders(self, query: str, page: int, page_size: int) -> LabOrderPage:
        raise NotImplementedError
