from dataclasses import dataclass
from datetime import date
from enum import Enum
from math import ceil
from uuid import UUID

from app.modules.consultations.domain.entities.consultation import Consultation, ConsultationStatus


class SortDirection(str, Enum):
    ASC = "asc"
    DESC = "desc"


class ConsultationSortField(str, Enum):
    CREATED_AT = "created_at"
    VISIT_NUMBER = "visit_number"
    STATUS = "status"
    FOLLOW_UP_DATE = "follow_up_date"


@dataclass(frozen=True, slots=True)
class ConsultationListCriteria:
    page: int = 1
    page_size: int = 20
    sort_by: ConsultationSortField = ConsultationSortField.CREATED_AT
    sort_dir: SortDirection = SortDirection.DESC
    status: ConsultationStatus | None = None
    patient_id: UUID | None = None
    doctor_id: UUID | None = None
    appointment_id: UUID | None = None
    date_from: date | None = None
    date_to: date | None = None


@dataclass(frozen=True, slots=True)
class ConsultationPage:
    items: list[Consultation]
    total: int
    page: int
    page_size: int

    @property
    def total_pages(self) -> int:
        if self.page_size <= 0:
            return 1
        return max(1, ceil(self.total / self.page_size))
