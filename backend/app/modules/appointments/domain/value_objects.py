from dataclasses import dataclass
from datetime import date
from enum import Enum
from math import ceil
from uuid import UUID

from app.modules.appointments.domain.entities.appointment import (
    Appointment,
    AppointmentPriority,
    AppointmentStatus,
    AppointmentType,
    Department,
)


class SortDirection(str, Enum):
    ASC = "asc"
    DESC = "desc"


class AppointmentSortField(str, Enum):
    CREATED_AT = "created_at"
    APPOINTMENT_DATE = "appointment_date"
    APPOINTMENT_TIME = "appointment_time"
    TOKEN_NUMBER = "token_number"
    STATUS = "status"
    PRIORITY = "priority"


@dataclass(frozen=True, slots=True)
class AppointmentListCriteria:
    page: int = 1
    page_size: int = 20
    sort_by: AppointmentSortField = AppointmentSortField.APPOINTMENT_DATE
    sort_dir: SortDirection = SortDirection.DESC
    status: AppointmentStatus | None = None
    priority: AppointmentPriority | None = None
    appointment_type: AppointmentType | None = None
    department: Department | None = None
    patient_id: UUID | None = None
    doctor_id: UUID | None = None
    date_from: date | None = None
    date_to: date | None = None


@dataclass(frozen=True, slots=True)
class AppointmentPage:
    items: list[Appointment]
    total: int
    page: int
    page_size: int

    @property
    def total_pages(self) -> int:
        if self.page_size <= 0:
            return 1
        return max(1, ceil(self.total / self.page_size))
