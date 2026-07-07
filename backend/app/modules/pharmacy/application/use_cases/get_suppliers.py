from app.modules.pharmacy.domain.repositories.pharmacy_supplier_repository import PharmacySupplierRepository


class GetSuppliersUseCase:
    def __init__(self, supplier_repository: PharmacySupplierRepository) -> None:
        self._suppliers = supplier_repository

    async def execute(self, active_only: bool = True):
        return await self._suppliers.list_suppliers(active_only=active_only)
