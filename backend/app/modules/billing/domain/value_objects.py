from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum
from math import ceil
from typing import TYPE_CHECKING
from uuid import UUID

if TYPE_CHECKING:
    from app.modules.billing.domain.entities.billing_entities import Invoice


class InvoiceStatus(StrEnum):
    DRAFT = "draft"
    ISSUED = "issued"
    PARTIALLY_PAID = "partially_paid"
    PAID = "paid"
    CANCELLED = "cancelled"


class PaymentMethod(StrEnum):
    CASH = "cash"
    CARD = "card"
    UPI = "upi"
    BANK_TRANSFER = "bank_transfer"
    CHEQUE = "cheque"
    OTHER = "other"


class BillingDepartment(StrEnum):
    CONSULTATION = "consultation"
    LABORATORY = "laboratory"
    RADIOLOGY = "radiology"
    PHARMACY = "pharmacy"
    PRESCRIPTION = "prescription"
    OTHER = "other"


class ReferenceType(StrEnum):
    LAB_ORDER = "lab_order"
    RADIOLOGY_ORDER = "radiology_order"
    DISPENSE_RECORD = "dispense_record"
    PRESCRIPTION = "prescription"
    MANUAL = "manual"


class ClaimStatus(StrEnum):
    PENDING = "pending"
    SUBMITTED = "submitted"
    APPROVED = "approved"
    REJECTED = "rejected"


class SortDirection(StrEnum):
    ASC = "asc"
    DESC = "desc"


class InvoiceSortField(StrEnum):
    CREATED_AT = "created_at"
    UPDATED_AT = "updated_at"
    INVOICE_NUMBER = "invoice_number"
    INVOICE_DATE = "invoice_date"
    GRAND_TOTAL = "grand_total"


@dataclass(frozen=True, slots=True)
class InvoiceListCriteria:
    page: int = 1
    page_size: int = 20
    sort_by: InvoiceSortField = InvoiceSortField.CREATED_AT
    sort_dir: SortDirection = SortDirection.DESC
    consultation_id: UUID | None = None
    patient_id: UUID | None = None
    doctor_id: UUID | None = None
    status: InvoiceStatus | None = None


@dataclass(frozen=True, slots=True)
class InvoicePage:
    items: list[Invoice]
    total: int
    page: int
    page_size: int

    @property
    def total_pages(self) -> int:
        if self.page_size <= 0:
            return 1
        return max(1, ceil(self.total / self.page_size))
