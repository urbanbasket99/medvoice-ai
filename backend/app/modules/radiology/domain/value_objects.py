from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum
from math import ceil
from typing import TYPE_CHECKING
from uuid import UUID

if TYPE_CHECKING:
    from app.modules.radiology.domain.entities.radiology_order import RadiologyOrder


class ImagingCategory(StrEnum):
    XRAY = "xray"
    CT = "ct"
    MRI = "mri"
    ULTRASOUND = "ultrasound"
    MAMMOGRAPHY = "mammography"
    FLUOROSCOPY = "fluoroscopy"
    NUCLEAR = "nuclear"
    OTHER = "other"


class RadiologyPriority(StrEnum):
    ROUTINE = "routine"
    URGENT = "urgent"
    STAT = "stat"


class RadiologyStatus(StrEnum):
    ORDERED = "ordered"
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class SortDirection(StrEnum):
    ASC = "asc"
    DESC = "desc"


class RadiologyOrderSortField(StrEnum):
    CREATED_AT = "created_at"
    UPDATED_AT = "updated_at"
    ORDER_NUMBER = "order_number"


@dataclass(frozen=True, slots=True)
class RadiologyOrderListCriteria:
    page: int = 1
    page_size: int = 20
    sort_by: RadiologyOrderSortField = RadiologyOrderSortField.CREATED_AT
    sort_dir: SortDirection = SortDirection.DESC
    consultation_id: UUID | None = None
    patient_id: UUID | None = None
    doctor_id: UUID | None = None
    status: RadiologyStatus | None = None


@dataclass(frozen=True, slots=True)
class RadiologyOrderPage:
    items: list[RadiologyOrder]
    total: int
    page: int
    page_size: int

    @property
    def total_pages(self) -> int:
        if self.page_size <= 0:
            return 1
        return max(1, ceil(self.total / self.page_size))
