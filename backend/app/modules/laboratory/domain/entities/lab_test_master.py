from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from uuid import UUID

from app.modules.laboratory.domain.value_objects import SampleType


@dataclass(slots=True)
class LabTestMaster:
    id: UUID
    test_code: str
    test_name: str
    department: str
    sample_type: SampleType
    normal_turnaround_time: str | None
    price: Decimal | None
    is_active: bool
    created_at: datetime
