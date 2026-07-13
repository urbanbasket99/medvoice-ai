from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum
from math import ceil
from typing import TYPE_CHECKING
from uuid import UUID

if TYPE_CHECKING:
    from app.modules.certificates.domain.entities.medical_certificate import MedicalCertificate


class CertificateType(StrEnum):
    FITNESS = "fitness"
    SICK_LEAVE = "sick_leave"
    MEDICAL_LEAVE = "medical_leave"
    GENERAL = "general"


class SortDirection(StrEnum):
    ASC = "asc"
    DESC = "desc"


class CertificateSortField(StrEnum):
    CREATED_AT = "created_at"
    UPDATED_AT = "updated_at"
    ISSUE_DATE = "issue_date"
    CERTIFICATE_NUMBER = "certificate_number"


@dataclass(frozen=True, slots=True)
class CertificateListCriteria:
    page: int = 1
    page_size: int = 20
    sort_by: CertificateSortField = CertificateSortField.CREATED_AT
    sort_dir: SortDirection = SortDirection.DESC
    patient_id: UUID | None = None
    doctor_id: UUID | None = None
    certificate_type: CertificateType | None = None


@dataclass(frozen=True, slots=True)
class CertificatePage:
    items: list[MedicalCertificate]
    total: int
    page: int
    page_size: int

    @property
    def total_pages(self) -> int:
        if self.page_size <= 0:
            return 1
        return max(1, ceil(self.total / self.page_size))
