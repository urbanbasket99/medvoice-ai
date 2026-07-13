from abc import ABC, abstractmethod
from uuid import UUID

from app.modules.billing.domain.entities.tpa import Tpa


class TpaRepository(ABC):
    @abstractmethod
    async def get_by_id(self, tpa_id: UUID) -> Tpa | None: ...

    @abstractmethod
    async def get_by_code(self, code: str) -> Tpa | None: ...

    @abstractmethod
    async def list_all(self, *, active_only: bool = False) -> list[Tpa]: ...

    @abstractmethod
    async def create(self, tpa: Tpa) -> Tpa: ...

    @abstractmethod
    async def update(self, tpa: Tpa) -> Tpa: ...
