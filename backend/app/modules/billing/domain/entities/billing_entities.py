"""Billing aggregate: Invoice, InvoiceItem, Payment, InsuranceClaim, InvoiceStatusEvent."""

from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from app.modules.billing.domain.value_objects import (
    BillingDepartment,
    ClaimStatus,
    InvoiceStatus,
    PaymentMethod,
    ReferenceType,
)


@dataclass(slots=True)
class InvoiceStatusEvent:
    id: UUID
    invoice_id: UUID
    status: InvoiceStatus
    notes: str | None
    changed_at: datetime


@dataclass(slots=True)
class InvoiceItem:
    id: UUID
    invoice_id: UUID
    service_name: str
    department: BillingDepartment
    quantity: int
    unit_price: Decimal
    discount_amount: Decimal
    tax_amount: Decimal
    total_amount: Decimal
    sort_order: int = 0
    reference_type: ReferenceType | None = None
    reference_id: UUID | None = None


@dataclass(slots=True)
class Payment:
    id: UUID
    invoice_id: UUID
    payment_number: str
    amount: Decimal
    payment_method: PaymentMethod
    payment_date: datetime
    created_at: datetime
    reference_number: str | None = None
    collected_by: UUID | None = None
    notes: str | None = None


@dataclass(slots=True)
class InsuranceClaim:
    id: UUID
    invoice_id: UUID
    created_at: datetime
    updated_at: datetime
    claim_number: str | None = None
    insurer_name: str | None = None
    status: ClaimStatus = ClaimStatus.PENDING
    claimed_amount: Decimal | None = None
    approved_amount: Decimal | None = None
    notes: str | None = None
    tpa_id: UUID | None = None
    submitted_at: datetime | None = None


@dataclass(slots=True)
class Invoice:
    id: UUID
    invoice_number: str
    patient_id: UUID
    doctor_id: UUID
    invoice_date: date
    status: InvoiceStatus
    subtotal: Decimal
    discount_amount: Decimal
    tax_amount: Decimal
    grand_total: Decimal
    paid_amount: Decimal
    balance: Decimal
    created_at: datetime
    updated_at: datetime
    consultation_id: UUID | None = None
    admission_id: UUID | None = None
    notes: str | None = None
    deleted_at: datetime | None = None
    is_provisional: bool = False
    is_tpa: bool = False
    tpa_id: UUID | None = None
    items: list[InvoiceItem] | None = None
    payments: list[Payment] | None = None
    status_events: list[InvoiceStatusEvent] | None = None
    insurance_claims: list[InsuranceClaim] | None = None
    patient_name: str | None = None
    patient_mrn: str | None = None
    patient_uhid: str | None = None
    patient_gender: str | None = None
    patient_date_of_birth: date | None = None
    doctor_name: str | None = None
    doctor_code: str | None = None
    doctor_specialization: str | None = None
    consultation_visit_number: str | None = None

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None
