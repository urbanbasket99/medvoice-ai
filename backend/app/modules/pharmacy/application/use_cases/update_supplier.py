from datetime import UTC, datetime
from uuid import UUID

from app.modules.pharmacy.application.dto.pharmacy_dto import UpdateSupplierInput
from app.modules.pharmacy.domain.exceptions import (
    PharmacySupplierCodeAlreadyExistsError,
    PharmacySupplierNotFoundError,
)
from app.modules.pharmacy.domain.repositories.pharmacy_supplier_repository import PharmacySupplierRepository


class UpdateSupplierUseCase:
    def __init__(self, supplier_repository: PharmacySupplierRepository) -> None:
        self._suppliers = supplier_repository

    async def execute(self, supplier_id: UUID, data: UpdateSupplierInput):
        existing = await self._suppliers.get_by_id(supplier_id)
        if existing is None:
            raise PharmacySupplierNotFoundError("Supplier not found.")

        code = data.code.strip().upper() if data.code else None
        if code:
            other = await self._suppliers.get_by_code(code)
            if other is not None and other.id != supplier_id:
                raise PharmacySupplierCodeAlreadyExistsError(f"Supplier code '{code}' already exists.")

        existing.name = data.name.strip()
        existing.code = code
        existing.contact_person = data.contact_person
        existing.phone = data.phone
        existing.email = data.email.strip().lower() if data.email else None
        existing.address = data.address
        existing.is_active = data.is_active
        existing.updated_at = datetime.now(UTC)
        return await self._suppliers.update(existing)
