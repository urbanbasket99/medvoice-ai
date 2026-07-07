from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from app.modules.billing.domain.value_objects import BillingDepartment, PaymentMethod, ReferenceType


@dataclass(frozen=True, slots=True)
class ConsultationContext:
    consultation_id: UUID
    patient_id: UUID
    doctor_id: UUID
    visit_number: str | None = None


@dataclass(frozen=True, slots=True)
class InvoiceItemInput:
    service_name: str
    department: BillingDepartment
    quantity: int
    unit_price: Decimal
    discount_amount: Decimal
    tax_amount: Decimal
    sort_order: int = 0
    reference_type: ReferenceType | None = None
    reference_id: UUID | None = None


@dataclass(frozen=True, slots=True)
class CreateInvoiceInput:
    consultation_id: UUID
    invoice_date: date
    notes: str | None
    items: tuple[InvoiceItemInput, ...]
    discount_amount: Decimal
    tax_amount: Decimal


@dataclass(frozen=True, slots=True)
class UpdateInvoiceInput:
    invoice_date: date
    notes: str | None
    items: tuple[InvoiceItemInput, ...]
    discount_amount: Decimal
    tax_amount: Decimal


@dataclass(frozen=True, slots=True)
class PaymentInput:
    invoice_id: UUID
    amount: Decimal
    payment_method: PaymentMethod
    payment_date: datetime
    reference_number: str | None
    collected_by: UUID | None
    notes: str | None


# --- Print DTOs ---

@dataclass(frozen=True, slots=True)
class InvoiceItemPrint:
    service_name: str
    department: str
    quantity: int
    unit_price: Decimal
    discount_amount: Decimal
    tax_amount: Decimal
    total_amount: Decimal
    sort_order: int


@dataclass(frozen=True, slots=True)
class InvoicePrintOutput:
    invoice_id: UUID
    invoice_number: str
    consultation_id: UUID
    invoice_date: date
    status: str
    subtotal: Decimal
    discount_amount: Decimal
    tax_amount: Decimal
    grand_total: Decimal
    paid_amount: Decimal
    balance: Decimal
    notes: str | None
    patient_name: str | None
    patient_mrn: str | None
    patient_uhid: str | None
    patient_gender: str | None
    patient_date_of_birth: date | None
    doctor_name: str | None
    doctor_code: str | None
    doctor_specialization: str | None
    consultation_visit_number: str | None
    items: list[InvoiceItemPrint]
    created_at: datetime


@dataclass(frozen=True, slots=True)
class PaymentPrintOutput:
    payment_id: UUID
    payment_number: str
    invoice_id: UUID
    invoice_number: str
    amount: Decimal
    payment_method: str
    payment_date: datetime
    reference_number: str | None
    notes: str | None
    patient_name: str | None
    patient_mrn: str | None
    doctor_name: str | None
    consultation_visit_number: str | None
    created_at: datetime


# --- Consultation charge suggestion ---

@dataclass(frozen=True, slots=True)
class InvoiceItemSuggestion:
    service_name: str
    department: BillingDepartment
    quantity: int
    unit_price: Decimal
    reference_type: ReferenceType | None
    reference_id: UUID | None
