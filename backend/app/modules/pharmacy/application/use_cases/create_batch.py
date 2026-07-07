from datetime import UTC, datetime
from uuid import uuid4

from app.modules.pharmacy.application.dto.pharmacy_dto import CreateBatchInput
from app.modules.pharmacy.domain.entities.pharmacy_batch import PharmacyBatch
from app.modules.pharmacy.domain.exceptions import PharmacyMedicineNotFoundError
from app.modules.pharmacy.domain.repositories.pharmacy_batch_repository import PharmacyBatchRepository
from app.modules.pharmacy.domain.repositories.pharmacy_medicine_repository import PharmacyMedicineRepository
from app.modules.pharmacy.domain.repositories.pharmacy_stock_repository import PharmacyStockRepository
from app.modules.pharmacy.domain.value_objects import StockMovementType


class CreateBatchUseCase:
    def __init__(
        self,
        batch_repository: PharmacyBatchRepository,
        medicine_repository: PharmacyMedicineRepository,
        stock_repository: PharmacyStockRepository,
    ) -> None:
        self._batches = batch_repository
        self._medicines = medicine_repository
        self._stock = stock_repository

    async def execute(self, data: CreateBatchInput) -> PharmacyBatch:
        medicine = await self._medicines.get_by_id(data.medicine_id)
        if medicine is None:
            raise PharmacyMedicineNotFoundError("Pharmacy medicine not found.")

        now = datetime.now(UTC)
        batch = PharmacyBatch(
            id=uuid4(),
            medicine_id=data.medicine_id,
            batch_number=data.batch_number,
            expiry_date=data.expiry_date,
            quantity=data.quantity,
            purchase_price=data.purchase_price,
            selling_price=data.selling_price,
            created_at=now,
            supplier_id=data.supplier_id,
        )
        created = await self._batches.create(batch)

        if data.quantity > 0:
            await self._stock.adjust_stock(
                medicine_id=data.medicine_id,
                quantity_delta=data.quantity,
                movement_type=StockMovementType.PURCHASE,
                notes=f"Batch {data.batch_number} received.",
                created_by=None,
                batch_id=created.id,
                reference_type="batch",
                reference_id=created.id,
            )

        return created
