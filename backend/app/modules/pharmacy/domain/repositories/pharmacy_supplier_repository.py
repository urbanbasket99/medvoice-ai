from abc import ABC, abstractmethod
from uuid import UUID

from app.modules.pharmacy.domain.entities.pharmacy_supplier import PharmacySupplier


class PharmacySupplierRepository(ABC):
    @abstractmethod
    async def list_suppliers(self, active_only: bool = True) -> list[PharmacySupplier]:
        raise NotImplementedError

    @abstractmethod
    async def get_by_id(self, supplier_id: UUID) -> PharmacySupplier | None:
        raise NotImplementedError

    @abstractmethod
    async def get_by_code(self, code: str) -> PharmacySupplier | None:
        raise NotImplementedError

    @abstractmethod
    async def create(self, supplier: PharmacySupplier) -> PharmacySupplier:
        raise NotImplementedError

    @abstractmethod
    async def update(self, supplier: PharmacySupplier) -> PharmacySupplier:
        raise NotImplementedError
