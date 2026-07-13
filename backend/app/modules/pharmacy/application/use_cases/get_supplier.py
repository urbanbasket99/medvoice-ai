from uuid import UUID

from app.modules.pharmacy.domain.exceptions import PharmacySupplierNotFoundError
from app.modules.pharmacy.domain.repositories.pharmacy_supplier_repository import PharmacySupplierRepository


class GetSupplierUseCase:
    def __init__(self, supplier_repository: PharmacySupplierRepository) -> None:
        self._suppliers = supplier_repository

    async def execute(self, supplier_id: UUID):
        supplier = await self._suppliers.get_by_id(supplier_id)
        if supplier is None:
            raise PharmacySupplierNotFoundError("Supplier not found.")
        return supplier
