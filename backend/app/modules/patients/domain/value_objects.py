"""Query value objects for the `PatientRepository` port.

These live in the domain layer (not `application/dto`) because the
repository *interface* — itself a domain concern — depends on them; the
domain layer must never depend upward on the application layer.
"""

from dataclasses import dataclass
from enum import Enum
from math import ceil

from app.modules.patients.domain.entities.patient import BloodGroup, Gender, Patient, PatientStatus


class SortDirection(str, Enum):
    ASC = "asc"
    DESC = "desc"


class PatientSortField(str, Enum):
    CREATED_AT = "created_at"
    FIRST_NAME = "first_name"
    LAST_NAME = "last_name"
    UHID = "uhid"
    MRN = "mrn"
    DATE_OF_BIRTH = "date_of_birth"
    REGISTRATION_DATE = "registration_date"


@dataclass(frozen=True, slots=True)
class PatientListCriteria:
    """Pagination, sorting, and column-filter parameters for `GET /patients`.

    `city` is matched case-insensitively as a substring (`ILIKE %value%`);
    every other filter is an exact match against a low-cardinality column.
    """

    page: int = 1
    page_size: int = 20
    sort_by: PatientSortField = PatientSortField.CREATED_AT
    sort_dir: SortDirection = SortDirection.DESC
    status: PatientStatus | None = None
    gender: Gender | None = None
    blood_group: BloodGroup | None = None
    city: str | None = None


@dataclass(frozen=True, slots=True)
class PatientPage:
    """A page of `Patient` results, returned by both list and search use cases."""

    items: list[Patient]
    total: int
    page: int
    page_size: int

    @property
    def total_pages(self) -> int:
        if self.page_size <= 0:
            return 1
        return max(1, ceil(self.total / self.page_size))
