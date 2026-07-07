from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum
from math import ceil
from typing import TYPE_CHECKING
from uuid import UUID

if TYPE_CHECKING:
    from app.modules.prescriptions.domain.entities.prescription import Prescription


class Frequency(StrEnum):
    OD = "od"
    BD = "bd"
    TDS = "tds"
    QID = "qid"
    HS = "hs"
    PRN = "prn"
    CUSTOM = "custom"


class Route(StrEnum):
    ORAL = "oral"
    TOPICAL = "topical"
    IV = "iv"
    IM = "im"
    SC = "sc"
    INHALATION = "inhalation"
    OTHER = "other"


@dataclass(frozen=True, slots=True)
class DosageInstruction:
    morning: bool = False
    afternoon: bool = False
    night: bool = False
    before_food: bool = False
    after_food: bool = False


@dataclass(frozen=True, slots=True)
class Duration:
    value: str


class SortDirection(StrEnum):
    ASC = "asc"
    DESC = "desc"


class PrescriptionSortField(StrEnum):
    CREATED_AT = "created_at"
    UPDATED_AT = "updated_at"


@dataclass(frozen=True, slots=True)
class PrescriptionListCriteria:
    page: int = 1
    page_size: int = 20
    sort_by: PrescriptionSortField = PrescriptionSortField.CREATED_AT
    sort_dir: SortDirection = SortDirection.DESC
    consultation_id: UUID | None = None
    patient_id: UUID | None = None
    doctor_id: UUID | None = None


@dataclass(frozen=True, slots=True)
class PrescriptionPage:
    items: list[Prescription]
    total: int
    page: int
    page_size: int

    @property
    def total_pages(self) -> int:
        if self.page_size <= 0:
            return 1
        return max(1, ceil(self.total / self.page_size))
