from dataclasses import dataclass
from datetime import datetime
from uuid import UUID

from app.modules.pharmacy.domain.value_objects import StockMovementType


@dataclass(slots=True)
class StockMovement:
    id: UUID
    medicine_id: UUID
    movement_type: StockMovementType
    quantity_delta: int
    created_at: datetime
    batch_id: UUID | None = None
    reference_type: str | None = None
    reference_id: UUID | None = None
    notes: str | None = None
    created_by: UUID | None = None
    medicine_name: str | None = None
    batch_number: str | None = None
