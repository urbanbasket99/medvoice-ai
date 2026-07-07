from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum
from math import ceil
from typing import TYPE_CHECKING
from uuid import UUID

if TYPE_CHECKING:
    from app.modules.laboratory.domain.entities.lab_order import LabOrder


class SampleType(StrEnum):
    BLOOD = "blood"
    URINE = "urine"
    STOOL = "stool"
    SWAB = "swab"
    SPUTUM = "sputum"
    CSF = "csf"
    TISSUE = "tissue"
    OTHER = "other"


class LabPriority(StrEnum):
    ROUTINE = "routine"
    URGENT = "urgent"
    STAT = "stat"


class LabStatus(StrEnum):
    ORDERED = "ordered"
    SAMPLE_COLLECTED = "sample_collected"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class SortDirection(StrEnum):
    ASC = "asc"
    DESC = "desc"


class LabOrderSortField(StrEnum):
    CREATED_AT = "created_at"
    UPDATED_AT = "updated_at"
    ORDER_NUMBER = "order_number"


@dataclass(frozen=True, slots=True)
class LabOrderListCriteria:
    page: int = 1
    page_size: int = 20
    sort_by: LabOrderSortField = LabOrderSortField.CREATED_AT
    sort_dir: SortDirection = SortDirection.DESC
    consultation_id: UUID | None = None
    patient_id: UUID | None = None
    doctor_id: UUID | None = None
    status: LabStatus | None = None


@dataclass(frozen=True, slots=True)
class LabOrderPage:
    items: list[LabOrder]
    total: int
    page: int
    page_size: int

    @property
    def total_pages(self) -> int:
        if self.page_size <= 0:
            return 1
        return max(1, ceil(self.total / self.page_size))
