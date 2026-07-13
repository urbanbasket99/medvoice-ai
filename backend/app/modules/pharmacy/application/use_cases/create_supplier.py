from datetime import UTC, datetime
from uuid import uuid4

from app.modules.pharmacy.application.dto.pharmacy_dto import CreateSupplierInput
from app.modules.pharmacy.domain.entities.pharmacy_supplier import PharmacySupplier
from app.modules.pharmacy.domain.exceptions import PharmacySupplierCodeAlreadyExistsError
from app.modules.pharmacy.domain.repositories.pharmacy_supplier_repository import PharmacySupplierRepository


class CreateSupplierUseCase:
    def __init__(self, supplier_repository: PharmacySupplierRepository) -> None:
        self._suppliers = supplier_repository

    async def execute(self, data: CreateSupplierInput) -> PharmacySupplier:
        code = data.code.strip().upper() if data.code else None
        if code:
            existing = await self._suppliers.get_by_code(code)
            if existing is not None:
                raise PharmacySupplierCodeAlreadyExistsError(f"Supplier code '{code}' already exists.")

        now = datetime.now(UTC)
        supplier = PharmacySupplier(
            id=uuid4(),
            name=data.name.strip(),
            code=code,
            contact_person=data.contact_person,
            phone=data.phone,
            email=data.email.strip().lower() if data.email else None,
            address=data.address,
            is_active=data.is_active,
            created_at=now,
            updated_at=now,
        )
        return await self._suppliers.create(supplier)
