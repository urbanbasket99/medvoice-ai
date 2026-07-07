from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from uuid import UUID

from app.modules.radiology.domain.value_objects import ImagingCategory


@dataclass(slots=True)
class RadiologyTestMaster:
    id: UUID
    test_code: str
    test_name: str
    category: ImagingCategory
    body_part: str
    estimated_duration: str | None
    price: Decimal | None
    is_active: bool
    created_at: datetime
