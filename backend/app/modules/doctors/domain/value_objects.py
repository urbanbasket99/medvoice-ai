"""Query value objects for the `DoctorRepository` port.

These live in the domain layer (not `application/dto`) because the
repository *interface* — itself a domain concern — depends on them; the
domain layer must never depend upward on the application layer. Mirrors
`app.modules.patients.domain.value_objects`.
"""

from dataclasses import dataclass
from enum import Enum
from math import ceil

from app.modules.doctors.domain.entities.doctor import Department, Doctor, DoctorStatus, Gender


class SortDirection(str, Enum):
    ASC = "asc"
    DESC = "desc"


class DoctorSortField(str, Enum):
    CREATED_AT = "created_at"
    FULL_NAME = "full_name"
    DOCTOR_CODE = "doctor_code"
    DEPARTMENT = "department"
    EXPERIENCE_YEARS = "experience_years"
    JOINING_DATE = "joining_date"


@dataclass(frozen=True, slots=True)
class DoctorListCriteria:
    """Pagination, sorting, and column-filter parameters for `GET /doctors`."""

    page: int = 1
    page_size: int = 20
    sort_by: DoctorSortField = DoctorSortField.CREATED_AT
    sort_dir: SortDirection = SortDirection.DESC
    status: DoctorStatus | None = None
    department: Department | None = None
    gender: Gender | None = None
    specialization: str | None = None


@dataclass(frozen=True, slots=True)
class DoctorPage:
    """A page of `Doctor` results, returned by both list and search use cases."""

    items: list[Doctor]
    total: int
    page: int
    page_size: int

    @property
    def total_pages(self) -> int:
        if self.page_size <= 0:
            return 1
        return max(1, ceil(self.total / self.page_size))
