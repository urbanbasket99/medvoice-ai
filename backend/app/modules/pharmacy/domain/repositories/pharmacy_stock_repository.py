from abc import ABC, abstractmethod
from uuid import UUID

from app.modules.pharmacy.domain.entities.pharmacy_medicine_stock import PharmacyMedicineStock
from app.modules.pharmacy.domain.entities.stock_movement import StockMovement
from app.modules.pharmacy.domain.value_objects import (
    InventoryListCriteria,
    InventoryPage,
    StockMovementListCriteria,
    StockMovementPage,
    StockMovementType,
)


class PharmacyStockRepository(ABC):
    @abstractmethod
    async def get_by_medicine_id(self, medicine_id: UUID) -> PharmacyMedicineStock | None:
        raise NotImplementedError

    @abstractmethod
    async def create_for_medicine(
        self,
        medicine_id: UUID,
        minimum_stock: int = 0,
        maximum_stock: int = 0,
    ) -> PharmacyMedicineStock:
        raise NotImplementedError

    @abstractmethod
    async def get_inventory(self, criteria: InventoryListCriteria) -> InventoryPage:
        raise NotImplementedError

    @abstractmethod
    async def get_low_stock(self) -> list[PharmacyMedicineStock]:
        raise NotImplementedError

    @abstractmethod
    async def adjust_stock(
        self,
        medicine_id: UUID,
        quantity_delta: int,
        movement_type: StockMovementType,
        notes: str | None,
        created_by: UUID | None,
        batch_id: UUID | None = None,
        reference_type: str | None = None,
        reference_id: UUID | None = None,
    ) -> tuple[PharmacyMedicineStock, StockMovement]:
        raise NotImplementedError

    @abstractmethod
    async def get_movement_history(self, criteria: StockMovementListCriteria) -> StockMovementPage:
        raise NotImplementedError

    @abstractmethod
    async def decrement_for_dispense(
        self,
        medicine_id: UUID,
        batch_id: UUID | None,
        quantity: int,
        dispense_id: UUID,
        created_by: UUID | None,
    ) -> StockMovement:
        raise NotImplementedError
