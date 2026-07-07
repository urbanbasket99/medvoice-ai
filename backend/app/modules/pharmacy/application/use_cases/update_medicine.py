from datetime import UTC, datetime
from uuid import UUID

from app.modules.pharmacy.application.dto.pharmacy_dto import UpdateMedicineInput
from app.modules.pharmacy.domain.entities.pharmacy_medicine import PharmacyMedicine
from app.modules.pharmacy.domain.exceptions import PharmacyMedicineNotFoundError
from app.modules.pharmacy.domain.repositories.pharmacy_medicine_repository import PharmacyMedicineRepository


class UpdateMedicineUseCase:
    def __init__(self, medicine_repository: PharmacyMedicineRepository) -> None:
        self._medicines = medicine_repository

    async def execute(self, medicine_id: UUID, data: UpdateMedicineInput) -> PharmacyMedicine:
        existing = await self._medicines.get_by_id(medicine_id)
        if existing is None:
            raise PharmacyMedicineNotFoundError("Pharmacy medicine not found.")

        updated = PharmacyMedicine(
            id=existing.id,
            medicine_code=existing.medicine_code,
            generic_name=data.generic_name,
            brand_name=data.brand_name,
            category=data.category,
            mrp=data.mrp,
            selling_price=data.selling_price,
            gst=data.gst,
            is_active=data.is_active,
            created_at=existing.created_at,
            updated_at=datetime.now(UTC),
            strength=data.strength,
            dosage_form=data.dosage_form,
            manufacturer=data.manufacturer,
            barcode=data.barcode,
            deleted_at=existing.deleted_at,
        )
        return await self._medicines.update(updated)
