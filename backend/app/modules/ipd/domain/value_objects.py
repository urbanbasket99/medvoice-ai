from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum
from math import ceil
from typing import TYPE_CHECKING
from uuid import UUID

if TYPE_CHECKING:
    from app.modules.ipd.domain.entities.admission import Admission
    from app.modules.ipd.domain.entities.bed import Bed
    from app.modules.ipd.domain.entities.ward import Ward


class WardType(StrEnum):
    GENERAL = "general"
    ICU = "icu"
    PRIVATE = "private"
    SEMI_PRIVATE = "semi_private"
    STEP_DOWN = "step_down"
    OTHER = "other"


class BedStatus(StrEnum):
    AVAILABLE = "available"
    OCCUPIED = "occupied"
    MAINTENANCE = "maintenance"


class AdmissionType(StrEnum):
    EMERGENCY = "emergency"
    PLANNED = "planned"
    TRANSFER = "transfer"


class AdmissionStatus(StrEnum):
    ADMITTED = "admitted"
    DISCHARGED = "discharged"
    CANCELLED = "cancelled"


class NursingNoteType(StrEnum):
    VITALS = "vitals"
    MEDICATION = "medication"
    OBSERVATION = "observation"
    PROCEDURE = "procedure"
    OTHER = "other"


class OtScheduleStatus(StrEnum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class ChargeType(StrEnum):
    ROOM = "room"
    NURSING = "nursing"
    OT = "ot"
    PHARMACY = "pharmacy"
    MISC = "misc"


class SortDirection(StrEnum):
    ASC = "asc"
    DESC = "desc"


class WardSortField(StrEnum):
    CREATED_AT = "created_at"
    UPDATED_AT = "updated_at"
    CODE = "code"
    NAME = "name"


class BedSortField(StrEnum):
    CREATED_AT = "created_at"
    UPDATED_AT = "updated_at"
    BED_NUMBER = "bed_number"
    STATUS = "status"


class AdmissionSortField(StrEnum):
    CREATED_AT = "created_at"
    UPDATED_AT = "updated_at"
    ADMISSION_DATE = "admission_date"
    ADMISSION_NUMBER = "admission_number"


@dataclass(frozen=True, slots=True)
class WardListCriteria:
    page: int = 1
    page_size: int = 20
    sort_by: WardSortField = WardSortField.CREATED_AT
    sort_dir: SortDirection = SortDirection.DESC
    ward_type: WardType | None = None
    is_active: bool | None = None
    search: str | None = None


@dataclass(frozen=True, slots=True)
class BedListCriteria:
    page: int = 1
    page_size: int = 20
    sort_by: BedSortField = BedSortField.CREATED_AT
    sort_dir: SortDirection = SortDirection.DESC
    ward_id: UUID | None = None
    status: BedStatus | None = None
    search: str | None = None


@dataclass(frozen=True, slots=True)
class AdmissionListCriteria:
    page: int = 1
    page_size: int = 20
    sort_by: AdmissionSortField = AdmissionSortField.CREATED_AT
    sort_dir: SortDirection = SortDirection.DESC
    patient_id: UUID | None = None
    admitting_doctor_id: UUID | None = None
    consultation_id: UUID | None = None
    bed_id: UUID | None = None
    status: AdmissionStatus | None = None
    admission_type: AdmissionType | None = None


@dataclass(frozen=True, slots=True)
class WardPage:
    items: list[Ward]
    total: int
    page: int
    page_size: int

    @property
    def total_pages(self) -> int:
        if self.page_size <= 0:
            return 1
        return max(1, ceil(self.total / self.page_size))


@dataclass(frozen=True, slots=True)
class BedPage:
    items: list[Bed]
    total: int
    page: int
    page_size: int

    @property
    def total_pages(self) -> int:
        if self.page_size <= 0:
            return 1
        return max(1, ceil(self.total / self.page_size))


@dataclass(frozen=True, slots=True)
class AdmissionPage:
    items: list[Admission]
    total: int
    page: int
    page_size: int

    @property
    def total_pages(self) -> int:
        if self.page_size <= 0:
            return 1
        return max(1, ceil(self.total / self.page_size))
