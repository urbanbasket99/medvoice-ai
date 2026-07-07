from datetime import UTC, datetime
from uuid import uuid4

from app.modules.pharmacy.application.dto.pharmacy_dto import CreateMedicineInput
from app.modules.pharmacy.domain.entities.pharmacy_medicine import PharmacyMedicine
from app.modules.pharmacy.domain.exceptions import PharmacyMedicineCodeAlreadyExistsError
from app.modules.pharmacy.domain.repositories.pharmacy_medicine_repository import PharmacyMedicineRepository
from app.modules.pharmacy.domain.repositories.pharmacy_stock_repository import PharmacyStockRepository


class CreateMedicineUseCase:
    def __init__(
        self,
        medicine_repository: PharmacyMedicineRepository,
        stock_repository: PharmacyStockRepository,
    ) -> None:
        self._medicines = medicine_repository
        self._stock = stock_repository

    async def execute(self, data: CreateMedicineInput) -> PharmacyMedicine:
        existing = await self._medicines.get_by_code(data.medicine_code)
        if existing is not None and not existing.is_deleted:
            raise PharmacyMedicineCodeAlreadyExistsError(
                f"Medicine code '{data.medicine_code}' already exists."
            )

        now = datetime.now(UTC)
        medicine_id = uuid4()
        medicine = PharmacyMedicine(
            id=medicine_id,
            medicine_code=data.medicine_code,
            generic_name=data.generic_name,
            brand_name=data.brand_name,
            category=data.category,
            mrp=data.mrp,
            selling_price=data.selling_price,
            gst=data.gst,
            is_active=data.is_active,
            created_at=now,
            updated_at=now,
            strength=data.strength,
            dosage_form=data.dosage_form,
            manufacturer=data.manufacturer,
            barcode=data.barcode,
        )
        created = await self._medicines.create(medicine)
        await self._stock.create_for_medicine(
            medicine_id,
            minimum_stock=data.minimum_stock,
            maximum_stock=data.maximum_stock,
        )
        return created
