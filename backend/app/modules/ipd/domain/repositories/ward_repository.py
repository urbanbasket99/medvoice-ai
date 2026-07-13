from abc import ABC, abstractmethod
from uuid import UUID

from app.modules.ipd.domain.entities.ward import Ward
from app.modules.ipd.domain.value_objects import WardListCriteria, WardPage


class WardRepository(ABC):
    @abstractmethod
    async def get_by_id(self, ward_id: UUID) -> Ward | None: ...

    @abstractmethod
    async def get_by_code(self, code: str) -> Ward | None: ...

    @abstractmethod
    async def create(self, ward: Ward) -> Ward: ...

    @abstractmethod
    async def update(self, ward: Ward) -> Ward: ...

    @abstractmethod
    async def soft_delete(self, ward_id: UUID) -> bool: ...

    @abstractmethod
    async def list_wards(self, criteria: WardListCriteria) -> WardPage: ...
