from abc import ABC, abstractmethod

from app.modules.laboratory.domain.entities.lab_test_master import LabTestMaster


class LabTestMasterRepository(ABC):
    @abstractmethod
    async def search(self, query: str, limit: int) -> list[LabTestMaster]:
        raise NotImplementedError

    @abstractmethod
    async def list_active(self, page: int, page_size: int) -> tuple[list[LabTestMaster], int]:
        raise NotImplementedError
