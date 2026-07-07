from abc import ABC, abstractmethod

from app.modules.radiology.domain.entities.radiology_test_master import RadiologyTestMaster


class RadiologyTestMasterRepository(ABC):
    @abstractmethod
    async def search(self, query: str, limit: int) -> list[RadiologyTestMaster]:
        raise NotImplementedError

    @abstractmethod
    async def list_active(self, page: int, page_size: int) -> tuple[list[RadiologyTestMaster], int]:
        raise NotImplementedError
