from datetime import UTC, datetime
from uuid import UUID

from app.modules.pharmacy.application.dto.pharmacy_dto import UpdateBatchInput
from app.modules.pharmacy.domain.entities.pharmacy_batch import PharmacyBatch
from app.modules.pharmacy.domain.exceptions import PharmacyBatchNotFoundError
from app.modules.pharmacy.domain.repositories.pharmacy_batch_repository import PharmacyBatchRepository


class UpdateBatchUseCase:
    def __init__(self, batch_repository: PharmacyBatchRepository) -> None:
        self._batches = batch_repository

    async def execute(self, batch_id: UUID, data: UpdateBatchInput) -> PharmacyBatch:
        existing = await self._batches.get_by_id(batch_id)
        if existing is None:
            raise PharmacyBatchNotFoundError("Pharmacy batch not found.")

        updated = PharmacyBatch(
            id=existing.id,
            medicine_id=existing.medicine_id,
            batch_number=data.batch_number,
            expiry_date=data.expiry_date,
            quantity=data.quantity,
            purchase_price=data.purchase_price,
            selling_price=data.selling_price,
            created_at=existing.created_at,
            supplier_id=data.supplier_id,
        )
        return await self._batches.update(updated)
