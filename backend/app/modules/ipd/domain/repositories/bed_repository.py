from abc import ABC, abstractmethod
from uuid import UUID

from app.modules.ipd.domain.entities.bed import Bed
from app.modules.ipd.domain.value_objects import BedListCriteria, BedPage


class BedRepository(ABC):
    @abstractmethod
    async def get_by_id(self, bed_id: UUID) -> Bed | None: ...

    @abstractmethod
    async def create(self, bed: Bed) -> Bed: ...

    @abstractmethod
    async def update(self, bed: Bed) -> Bed: ...

    @abstractmethod
    async def soft_delete(self, bed_id: UUID) -> bool: ...

    @abstractmethod
    async def list_beds(self, criteria: BedListCriteria) -> BedPage: ...

    @abstractmethod
    async def list_available(self, ward_id: UUID | None = None) -> list[Bed]: ...

    @abstractmethod
    async def ward_exists(self, ward_id: UUID) -> bool: ...
