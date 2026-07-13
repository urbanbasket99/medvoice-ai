from uuid import UUID

from app.modules.pharmacy.application.dto.pharmacy_dto import StockReturnInput
from app.modules.pharmacy.domain.entities.pharmacy_medicine_stock import PharmacyMedicineStock
from app.modules.pharmacy.domain.entities.stock_movement import StockMovement
from app.modules.pharmacy.domain.exceptions import PharmacyMedicineNotFoundError, PharmacyStockNotFoundError
from app.modules.pharmacy.domain.repositories.pharmacy_medicine_repository import PharmacyMedicineRepository
from app.modules.pharmacy.domain.repositories.pharmacy_stock_repository import PharmacyStockRepository
from app.modules.pharmacy.domain.value_objects import StockMovementType, StockReturnKind


class ReturnStockUseCase:
    def __init__(
        self,
        stock_repository: PharmacyStockRepository,
        medicine_repository: PharmacyMedicineRepository,
    ) -> None:
        self._stock = stock_repository
        self._medicines = medicine_repository

    async def execute(
        self,
        data: StockReturnInput,
        created_by: UUID | None = None,
    ) -> tuple[PharmacyMedicineStock, StockMovement]:
        if data.quantity <= 0:
            raise ValueError("Return quantity must be positive.")

        medicine = await self._medicines.get_by_id(data.medicine_id)
        if medicine is None:
            raise PharmacyMedicineNotFoundError("Pharmacy medicine not found.")

        stock = await self._stock.get_by_medicine_id(data.medicine_id)
        if stock is None:
            raise PharmacyStockNotFoundError("Stock record not found for this medicine.")

        if data.return_kind == StockReturnKind.SALES:
            quantity_delta = data.quantity
            reference_type = "sales_return"
        else:
            quantity_delta = -data.quantity
            reference_type = "purchase_return"

        return await self._stock.adjust_stock(
            medicine_id=data.medicine_id,
            quantity_delta=quantity_delta,
            movement_type=StockMovementType.RETURN,
            notes=data.notes,
            created_by=created_by,
            batch_id=data.batch_id,
            reference_type=reference_type,
            reference_id=None,
        )
