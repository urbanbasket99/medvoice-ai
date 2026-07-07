from abc import ABC, abstractmethod
from uuid import UUID

from app.modules.prescriptions.domain.entities.medicine_master import MedicineMaster


class MedicineMasterRepository(ABC):
    @abstractmethod
    async def get_by_id(self, medicine_id: UUID) -> MedicineMaster | None:
        raise NotImplementedError

    @abstractmethod
    async def search(self, query: str, limit: int) -> list[MedicineMaster]:
        raise NotImplementedError
