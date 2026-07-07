from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass(slots=True)
class PharmacyMedicineStock:
    id: UUID
    medicine_id: UUID
    current_stock: int
    reserved_stock: int
    minimum_stock: int
    maximum_stock: int
    updated_at: datetime
    medicine_code: str | None = None
    generic_name: str | None = None
    brand_name: str | None = None
    category: str | None = None

    @property
    def available_stock(self) -> int:
        return max(0, self.current_stock - self.reserved_stock)

    @property
    def is_low_stock(self) -> bool:
        return self.current_stock <= self.minimum_stock
