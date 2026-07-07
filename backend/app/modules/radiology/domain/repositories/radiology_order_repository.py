from abc import ABC, abstractmethod
from uuid import UUID

from app.modules.radiology.domain.entities.radiology_order import RadiologyOrder
from app.modules.radiology.domain.value_objects import (
    RadiologyOrderListCriteria,
    RadiologyOrderPage,
    RadiologyStatus,
)


class RadiologyOrderRepository(ABC):
    @abstractmethod
    async def get_by_id(self, radiology_order_id: UUID) -> RadiologyOrder | None:
        raise NotImplementedError

    @abstractmethod
    async def create(self, radiology_order: RadiologyOrder) -> RadiologyOrder:
        raise NotImplementedError

    @abstractmethod
    async def update(self, radiology_order: RadiologyOrder) -> RadiologyOrder:
        raise NotImplementedError

    @abstractmethod
    async def update_status(
        self,
        radiology_order_id: UUID,
        status: RadiologyStatus,
        notes: str | None = None,
    ) -> RadiologyOrder:
        raise NotImplementedError

    @abstractmethod
    async def soft_delete(self, radiology_order_id: UUID) -> bool:
        raise NotImplementedError

    @abstractmethod
    async def list_radiology_orders(self, criteria: RadiologyOrderListCriteria) -> RadiologyOrderPage:
        raise NotImplementedError

    @abstractmethod
    async def search_radiology_orders(self, query: str, page: int, page_size: int) -> RadiologyOrderPage:
        raise NotImplementedError
