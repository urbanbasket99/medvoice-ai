from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.billing.application.dto.billing_dto import (
    CreateClaimInput,
    CreateInvoiceInput,
    CreateTpaInput,
    InvoiceItemInput,
    InvoiceItemPrint,
    InvoiceItemSuggestion,
    InvoicePrintOutput,
    PaymentInput,
    PaymentPrintOutput,
    UpdateClaimInput,
    UpdateInvoiceInput,
    UpdateTpaInput,
)
from app.modules.billing.domain.entities.billing_entities import (
    InsuranceClaim,
    Invoice,
    InvoiceItem,
    InvoiceStatusEvent,
    Payment,
)
from app.modules.billing.domain.entities.tpa import Tpa
from app.modules.billing.domain.value_objects import (
    BillingDepartment,
    ClaimStatus,
    CollectionReportGroupBy,
    CollectionReportRow,
    InvoicePage,
    InvoiceStatus,
    PaymentMethod,
    ReferenceType,
)


# ---- Request schemas ----

class InvoiceItemRequest(BaseModel):
    service_name: str = Field(min_length=1, max_length=200)
    department: BillingDepartment
    quantity: int = Field(ge=1, default=1)
    unit_price: Decimal = Field(ge=0)
    discount_amount: Decimal = Field(ge=0, default=Decimal("0"))
    tax_amount: Decimal = Field(ge=0, default=Decimal("0"))
    sort_order: int = 0
    reference_type: ReferenceType | None = None
    reference_id: UUID | None = None

    def to_input(self) -> InvoiceItemInput:
        return InvoiceItemInput(
            service_name=self.service_name,
            department=self.department,
            quantity=self.quantity,
            unit_price=self.unit_price,
            discount_amount=self.discount_amount,
            tax_amount=self.tax_amount,
            sort_order=self.sort_order,
            reference_type=self.reference_type,
            reference_id=self.reference_id,
        )


class InvoiceCreateRequest(BaseModel):
    consultation_id: UUID
    invoice_date: date
    notes: str | None = Field(default=None, max_length=4000)
    items: list[InvoiceItemRequest] = Field(min_length=1)
    discount_amount: Decimal = Field(ge=0, default=Decimal("0"))
    tax_amount: Decimal = Field(ge=0, default=Decimal("0"))
    is_provisional: bool = False
    is_tpa: bool = False
    tpa_id: UUID | None = None

    def to_input(self) -> CreateInvoiceInput:
        return CreateInvoiceInput(
            consultation_id=self.consultation_id,
            invoice_date=self.invoice_date,
            notes=self.notes,
            items=tuple(item.to_input() for item in self.items),
            discount_amount=self.discount_amount,
            tax_amount=self.tax_amount,
            is_provisional=self.is_provisional,
            is_tpa=self.is_tpa,
            tpa_id=self.tpa_id,
        )


class InvoiceUpdateRequest(BaseModel):
    invoice_date: date
    notes: str | None = Field(default=None, max_length=4000)
    items: list[InvoiceItemRequest] = Field(min_length=1)
    discount_amount: Decimal = Field(ge=0, default=Decimal("0"))
    tax_amount: Decimal = Field(ge=0, default=Decimal("0"))
    is_provisional: bool = False
    is_tpa: bool = False
    tpa_id: UUID | None = None

    def to_input(self) -> UpdateInvoiceInput:
        return UpdateInvoiceInput(
            invoice_date=self.invoice_date,
            notes=self.notes,
            items=tuple(item.to_input() for item in self.items),
            discount_amount=self.discount_amount,
            tax_amount=self.tax_amount,
            is_provisional=self.is_provisional,
            is_tpa=self.is_tpa,
            tpa_id=self.tpa_id,
        )


class PaymentCreateRequest(BaseModel):
    invoice_id: UUID
    amount: Decimal = Field(gt=0)
    payment_method: PaymentMethod
    payment_date: datetime
    reference_number: str | None = Field(default=None, max_length=100)
    collected_by: UUID | None = None
    notes: str | None = Field(default=None, max_length=2000)

    def to_input(self) -> PaymentInput:
        return PaymentInput(
            invoice_id=self.invoice_id,
            amount=self.amount,
            payment_method=self.payment_method,
            payment_date=self.payment_date,
            reference_number=self.reference_number,
            collected_by=self.collected_by,
            notes=self.notes,
        )


# ---- Response schemas ----

class InvoiceItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    invoice_id: UUID
    service_name: str
    department: BillingDepartment
    quantity: int
    unit_price: Decimal
    discount_amount: Decimal
    tax_amount: Decimal
    total_amount: Decimal
    sort_order: int
    reference_type: ReferenceType | None
    reference_id: UUID | None

    @classmethod
    def from_entity(cls, item: InvoiceItem) -> "InvoiceItemResponse":
        return cls(
            id=item.id,
            invoice_id=item.invoice_id,
            service_name=item.service_name,
            department=item.department,
            quantity=item.quantity,
            unit_price=item.unit_price,
            discount_amount=item.discount_amount,
            tax_amount=item.tax_amount,
            total_amount=item.total_amount,
            sort_order=item.sort_order,
            reference_type=item.reference_type,
            reference_id=item.reference_id,
        )


class InvoiceStatusEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    invoice_id: UUID
    status: InvoiceStatus
    notes: str | None
    changed_at: datetime

    @classmethod
    def from_entity(cls, event: InvoiceStatusEvent) -> "InvoiceStatusEventResponse":
        return cls(
            id=event.id,
            invoice_id=event.invoice_id,
            status=event.status,
            notes=event.notes,
            changed_at=event.changed_at,
        )


class InsuranceClaimResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    invoice_id: UUID
    claim_number: str | None
    insurer_name: str | None
    status: ClaimStatus
    claimed_amount: Decimal | None
    approved_amount: Decimal | None
    notes: str | None
    tpa_id: UUID | None
    submitted_at: datetime | None
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_entity(cls, claim: InsuranceClaim) -> "InsuranceClaimResponse":
        return cls(
            id=claim.id,
            invoice_id=claim.invoice_id,
            claim_number=claim.claim_number,
            insurer_name=claim.insurer_name,
            status=claim.status,
            claimed_amount=claim.claimed_amount,
            approved_amount=claim.approved_amount,
            notes=claim.notes,
            tpa_id=claim.tpa_id,
            submitted_at=claim.submitted_at,
            created_at=claim.created_at,
            updated_at=claim.updated_at,
        )


class PaymentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    invoice_id: UUID
    payment_number: str
    amount: Decimal
    payment_method: PaymentMethod
    reference_number: str | None
    collected_by: UUID | None
    payment_date: datetime
    notes: str | None
    created_at: datetime

    @classmethod
    def from_entity(cls, payment: Payment) -> "PaymentResponse":
        return cls(
            id=payment.id,
            invoice_id=payment.invoice_id,
            payment_number=payment.payment_number,
            amount=payment.amount,
            payment_method=payment.payment_method,
            reference_number=payment.reference_number,
            collected_by=payment.collected_by,
            payment_date=payment.payment_date,
            notes=payment.notes,
            created_at=payment.created_at,
        )


class InvoiceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    invoice_number: str
    consultation_id: UUID | None
    admission_id: UUID | None = None
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
    notes: str | None
    is_provisional: bool = False
    is_tpa: bool = False
    tpa_id: UUID | None = None
    created_at: datetime
    updated_at: datetime
    patient_name: str | None = None
    patient_mrn: str | None = None
    patient_uhid: str | None = None
    patient_gender: str | None = None
    patient_date_of_birth: date | None = None
    doctor_name: str | None = None
    doctor_code: str | None = None
    doctor_specialization: str | None = None
    consultation_visit_number: str | None = None
    items: list[InvoiceItemResponse] = Field(default_factory=list)
    payments: list[PaymentResponse] = Field(default_factory=list)
    status_events: list[InvoiceStatusEventResponse] = Field(default_factory=list)
    insurance_claims: list[InsuranceClaimResponse] = Field(default_factory=list)

    @classmethod
    def from_entity(cls, invoice: Invoice) -> "InvoiceResponse":
        return cls(
            id=invoice.id,
            invoice_number=invoice.invoice_number,
            consultation_id=invoice.consultation_id,
            admission_id=invoice.admission_id,
            patient_id=invoice.patient_id,
            doctor_id=invoice.doctor_id,
            invoice_date=invoice.invoice_date,
            status=invoice.status,
            subtotal=invoice.subtotal,
            discount_amount=invoice.discount_amount,
            tax_amount=invoice.tax_amount,
            grand_total=invoice.grand_total,
            paid_amount=invoice.paid_amount,
            balance=invoice.balance,
            notes=invoice.notes,
            is_provisional=invoice.is_provisional,
            is_tpa=invoice.is_tpa,
            tpa_id=invoice.tpa_id,
            created_at=invoice.created_at,
            updated_at=invoice.updated_at,
            patient_name=invoice.patient_name,
            patient_mrn=invoice.patient_mrn,
            patient_uhid=invoice.patient_uhid,
            patient_gender=invoice.patient_gender,
            patient_date_of_birth=invoice.patient_date_of_birth,
            doctor_name=invoice.doctor_name,
            doctor_code=invoice.doctor_code,
            doctor_specialization=invoice.doctor_specialization,
            consultation_visit_number=invoice.consultation_visit_number,
            items=[InvoiceItemResponse.from_entity(i) for i in invoice.items or []],
            payments=[PaymentResponse.from_entity(p) for p in invoice.payments or []],
            status_events=[InvoiceStatusEventResponse.from_entity(e) for e in invoice.status_events or []],
            insurance_claims=[InsuranceClaimResponse.from_entity(c) for c in invoice.insurance_claims or []],
        )


class InvoiceListResponse(BaseModel):
    items: list[InvoiceResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

    @classmethod
    def from_page(cls, page: InvoicePage) -> "InvoiceListResponse":
        return cls(
            items=[InvoiceResponse.from_entity(item) for item in page.items],
            total=page.total,
            page=page.page,
            page_size=page.page_size,
            total_pages=page.total_pages,
        )


class PaymentListResponse(BaseModel):
    items: list[PaymentResponse]

    @classmethod
    def from_entities(cls, payments: list[Payment]) -> "PaymentListResponse":
        return cls(items=[PaymentResponse.from_entity(p) for p in payments])


# ---- Print schemas ----

class InvoiceItemPrintResponse(BaseModel):
    service_name: str
    department: str
    quantity: int
    unit_price: Decimal
    discount_amount: Decimal
    tax_amount: Decimal
    total_amount: Decimal
    sort_order: int


class InvoicePrintResponse(BaseModel):
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
    items: list[InvoiceItemPrintResponse]
    created_at: datetime

    @classmethod
    def from_output(cls, output: InvoicePrintOutput) -> "InvoicePrintResponse":
        return cls(
            invoice_id=output.invoice_id,
            invoice_number=output.invoice_number,
            consultation_id=output.consultation_id,
            invoice_date=output.invoice_date,
            status=output.status,
            subtotal=output.subtotal,
            discount_amount=output.discount_amount,
            tax_amount=output.tax_amount,
            grand_total=output.grand_total,
            paid_amount=output.paid_amount,
            balance=output.balance,
            notes=output.notes,
            patient_name=output.patient_name,
            patient_mrn=output.patient_mrn,
            patient_uhid=output.patient_uhid,
            patient_gender=output.patient_gender,
            patient_date_of_birth=output.patient_date_of_birth,
            doctor_name=output.doctor_name,
            doctor_code=output.doctor_code,
            doctor_specialization=output.doctor_specialization,
            consultation_visit_number=output.consultation_visit_number,
            items=[
                InvoiceItemPrintResponse(
                    service_name=item.service_name,
                    department=item.department,
                    quantity=item.quantity,
                    unit_price=item.unit_price,
                    discount_amount=item.discount_amount,
                    tax_amount=item.tax_amount,
                    total_amount=item.total_amount,
                    sort_order=item.sort_order,
                )
                for item in output.items
            ],
            created_at=output.created_at,
        )


class PaymentPrintResponse(BaseModel):
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

    @classmethod
    def from_output(cls, output: PaymentPrintOutput) -> "PaymentPrintResponse":
        return cls(
            payment_id=output.payment_id,
            payment_number=output.payment_number,
            invoice_id=output.invoice_id,
            invoice_number=output.invoice_number,
            amount=output.amount,
            payment_method=output.payment_method,
            payment_date=output.payment_date,
            reference_number=output.reference_number,
            notes=output.notes,
            patient_name=output.patient_name,
            patient_mrn=output.patient_mrn,
            doctor_name=output.doctor_name,
            consultation_visit_number=output.consultation_visit_number,
            created_at=output.created_at,
        )


# ---- Consultation charges suggestion ----

class InvoiceItemSuggestionResponse(BaseModel):
    service_name: str
    department: BillingDepartment
    quantity: int
    unit_price: Decimal
    reference_type: ReferenceType | None
    reference_id: UUID | None

    @classmethod
    def from_dto(cls, dto: InvoiceItemSuggestion) -> "InvoiceItemSuggestionResponse":
        return cls(
            service_name=dto.service_name,
            department=dto.department,
            quantity=dto.quantity,
            unit_price=dto.unit_price,
            reference_type=dto.reference_type,
            reference_id=dto.reference_id,
        )


class ConsultationChargesResponse(BaseModel):
    items: list[InvoiceItemSuggestionResponse]

    @classmethod
    def from_dtos(cls, dtos: list[InvoiceItemSuggestion]) -> "ConsultationChargesResponse":
        return cls(items=[InvoiceItemSuggestionResponse.from_dto(d) for d in dtos])


# ---- TPA ----

class TpaCreateRequest(BaseModel):
    code: str = Field(min_length=1, max_length=30)
    name: str = Field(min_length=1, max_length=200)
    contact_person: str | None = Field(default=None, max_length=150)
    phone: str | None = Field(default=None, max_length=20)
    email: str | None = Field(default=None, max_length=255)
    address: str | None = None
    is_active: bool = True

    def to_input(self) -> CreateTpaInput:
        return CreateTpaInput(
            code=self.code,
            name=self.name,
            contact_person=self.contact_person,
            phone=self.phone,
            email=self.email,
            address=self.address,
            is_active=self.is_active,
        )


class TpaUpdateRequest(BaseModel):
    code: str = Field(min_length=1, max_length=30)
    name: str = Field(min_length=1, max_length=200)
    contact_person: str | None = Field(default=None, max_length=150)
    phone: str | None = Field(default=None, max_length=20)
    email: str | None = Field(default=None, max_length=255)
    address: str | None = None
    is_active: bool = True

    def to_input(self) -> UpdateTpaInput:
        return UpdateTpaInput(
            code=self.code,
            name=self.name,
            contact_person=self.contact_person,
            phone=self.phone,
            email=self.email,
            address=self.address,
            is_active=self.is_active,
        )


class TpaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    code: str
    name: str
    contact_person: str | None
    phone: str | None
    email: str | None
    address: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_entity(cls, tpa: Tpa) -> "TpaResponse":
        return cls(
            id=tpa.id,
            code=tpa.code,
            name=tpa.name,
            contact_person=tpa.contact_person,
            phone=tpa.phone,
            email=tpa.email,
            address=tpa.address,
            is_active=tpa.is_active,
            created_at=tpa.created_at,
            updated_at=tpa.updated_at,
        )


# ---- Insurance claims ----

class ClaimCreateRequest(BaseModel):
    claim_number: str | None = Field(default=None, max_length=50)
    insurer_name: str | None = Field(default=None, max_length=200)
    status: ClaimStatus = ClaimStatus.PENDING
    claimed_amount: Decimal | None = Field(default=None, ge=0)
    approved_amount: Decimal | None = Field(default=None, ge=0)
    notes: str | None = None
    tpa_id: UUID | None = None

    def to_input(self) -> CreateClaimInput:
        return CreateClaimInput(
            claim_number=self.claim_number,
            insurer_name=self.insurer_name,
            status=self.status.value,
            claimed_amount=self.claimed_amount,
            approved_amount=self.approved_amount,
            notes=self.notes,
            tpa_id=self.tpa_id,
        )


class ClaimUpdateRequest(BaseModel):
    claim_number: str | None = Field(default=None, max_length=50)
    insurer_name: str | None = Field(default=None, max_length=200)
    status: ClaimStatus = ClaimStatus.PENDING
    claimed_amount: Decimal | None = Field(default=None, ge=0)
    approved_amount: Decimal | None = Field(default=None, ge=0)
    notes: str | None = None
    tpa_id: UUID | None = None

    def to_input(self) -> UpdateClaimInput:
        return UpdateClaimInput(
            claim_number=self.claim_number,
            insurer_name=self.insurer_name,
            status=self.status.value,
            claimed_amount=self.claimed_amount,
            approved_amount=self.approved_amount,
            notes=self.notes,
            tpa_id=self.tpa_id,
        )


# ---- Collection reports ----

class CollectionReportRowResponse(BaseModel):
    group_key: str
    group_label: str
    invoice_count: int
    total_billed: Decimal
    total_collected: Decimal
    outstanding: Decimal

    @classmethod
    def from_row(cls, row: CollectionReportRow) -> "CollectionReportRowResponse":
        return cls(
            group_key=row.group_key,
            group_label=row.group_label,
            invoice_count=row.invoice_count,
            total_billed=row.total_billed,
            total_collected=row.total_collected,
            outstanding=row.outstanding,
        )


class CollectionReportResponse(BaseModel):
    group_by: CollectionReportGroupBy
    date_from: date
    date_to: date
    rows: list[CollectionReportRowResponse]

    @classmethod
    def from_rows(
        cls,
        group_by: CollectionReportGroupBy,
        date_from: date,
        date_to: date,
        rows: list[CollectionReportRow],
    ) -> "CollectionReportResponse":
        return cls(
            group_by=group_by,
            date_from=date_from,
            date_to=date_to,
            rows=[CollectionReportRowResponse.from_row(r) for r in rows],
        )
