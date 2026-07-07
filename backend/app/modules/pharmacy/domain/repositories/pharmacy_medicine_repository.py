from abc import ABC, abstractmethod
from uuid import UUID

from app.modules.pharmacy.domain.entities.pharmacy_medicine import PharmacyMedicine
from app.modules.pharmacy.domain.value_objects import MedicineListCriteria, MedicinePage


class PharmacyMedicineRepository(ABC):
    @abstractmethod
    async def get_by_id(self, medicine_id: UUID) -> PharmacyMedicine | None:
        raise NotImplementedError

    @abstractmethod
    async def get_by_code(self, medicine_code: str) -> PharmacyMedicine | None:
        raise NotImplementedError

    @abstractmethod
    async def create(self, medicine: PharmacyMedicine) -> PharmacyMedicine:
        raise NotImplementedError

    @abstractmethod
    async def update(self, medicine: PharmacyMedicine) -> PharmacyMedicine:
        raise NotImplementedError

    @abstractmethod
    async def soft_delete(self, medicine_id: UUID) -> bool:
        raise NotImplementedError

    @abstractmethod
    async def list_medicines(self, criteria: MedicineListCriteria) -> MedicinePage:
        raise NotImplementedError

    @abstractmethod
    async def search_medicines(self, query: str, page: int, page_size: int) -> MedicinePage:
        raise NotImplementedError
