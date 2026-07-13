from datetime import UTC, datetime
from decimal import Decimal
from uuid import uuid4

from app.modules.billing.application.interfaces.invoice_number_generator import InvoiceNumberGenerator
from app.modules.billing.domain.entities.billing_entities import Invoice, InvoiceItem, InvoiceStatusEvent
from app.modules.billing.domain.repositories.invoice_repository import InvoiceRepository
from app.modules.billing.domain.value_objects import BillingDepartment, InvoiceStatus, ReferenceType
from app.modules.ipd.application.dto.ipd_dto import CreateAdmissionChargeInput, GenerateAdmissionInvoiceInput
from app.modules.ipd.domain.entities.clinical import AdmissionCharge
from app.modules.ipd.domain.exceptions import AdmissionNotFoundError, NoUnbilledChargesError
from app.modules.ipd.domain.repositories.admission_repository import AdmissionRepository
from app.modules.ipd.domain.repositories.clinical_repository import ClinicalRepository
from app.modules.ipd.domain.value_objects import ChargeType


_CHARGE_DEPARTMENT: dict[ChargeType, BillingDepartment] = {
    ChargeType.ROOM: BillingDepartment.IPD,
    ChargeType.NURSING: BillingDepartment.IPD,
    ChargeType.OT: BillingDepartment.IPD,
    ChargeType.PHARMACY: BillingDepartment.PHARMACY,
    ChargeType.MISC: BillingDepartment.IPD,
}


class ListAdmissionChargesUseCase:
    def __init__(self, clinical_repository: ClinicalRepository) -> None:
        self._clinical = clinical_repository

    async def execute(self, admission_id) -> list[AdmissionCharge]:
        if not await self._clinical.admission_exists(admission_id):
            raise AdmissionNotFoundError("Admission not found.")
        return await self._clinical.list_charges(admission_id)


class CreateAdmissionChargeUseCase:
    def __init__(self, clinical_repository: ClinicalRepository) -> None:
        self._clinical = clinical_repository

    async def execute(self, data: CreateAdmissionChargeInput) -> AdmissionCharge:
        if not await self._clinical.admission_exists(data.admission_id):
            raise AdmissionNotFoundError("Admission not found.")

        now = datetime.now(UTC)
        charge = AdmissionCharge(
            id=uuid4(),
            admission_id=data.admission_id,
            charge_type=data.charge_type,
            description=data.description,
            amount=data.amount,
            charge_date=data.charge_date,
            created_at=now,
            updated_at=now,
        )
        return await self._clinical.create_charge(charge)


class GenerateAdmissionInvoiceUseCase:
    def __init__(
        self,
        clinical_repository: ClinicalRepository,
        admission_repository: AdmissionRepository,
        invoice_repository: InvoiceRepository,
        invoice_number_generator: InvoiceNumberGenerator,
    ) -> None:
        self._clinical = clinical_repository
        self._admissions = admission_repository
        self._invoices = invoice_repository
        self._invoice_numbers = invoice_number_generator

    async def execute(self, data: GenerateAdmissionInvoiceInput) -> Invoice:
        admission = await self._admissions.get_by_id(data.admission_id)
        if admission is None:
            raise AdmissionNotFoundError("Admission not found.")

        charges = await self._clinical.list_unbilled_charges(data.admission_id)
        if not charges:
            raise NoUnbilledChargesError("No unbilled charges found for this admission.")

        now = datetime.now(UTC)
        invoice_id = uuid4()
        invoice_number = await self._invoice_numbers.generate()
        items: list[InvoiceItem] = []
        subtotal = Decimal("0")

        for index, charge in enumerate(charges):
            total = charge.amount
            subtotal += total
            items.append(
                InvoiceItem(
                    id=uuid4(),
                    invoice_id=invoice_id,
                    service_name=charge.description,
                    department=_CHARGE_DEPARTMENT[charge.charge_type],
                    quantity=1,
                    unit_price=charge.amount,
                    discount_amount=Decimal("0"),
                    tax_amount=Decimal("0"),
                    total_amount=total,
                    sort_order=index,
                    reference_type=ReferenceType.IPD_CHARGE,
                    reference_id=charge.id,
                )
            )

        invoice = Invoice(
            id=invoice_id,
            invoice_number=invoice_number,
            consultation_id=None,
            admission_id=admission.id,
            patient_id=admission.patient_id,
            doctor_id=admission.admitting_doctor_id,
            invoice_date=data.invoice_date,
            status=InvoiceStatus.DRAFT,
            subtotal=subtotal,
            discount_amount=Decimal("0"),
            tax_amount=Decimal("0"),
            grand_total=subtotal,
            paid_amount=Decimal("0"),
            balance=subtotal,
            notes=data.notes,
            created_at=now,
            updated_at=now,
            items=items,
            status_events=[
                InvoiceStatusEvent(
                    id=uuid4(),
                    invoice_id=invoice_id,
                    status=InvoiceStatus.DRAFT,
                    notes="IPD invoice generated from admission charges.",
                    changed_at=now,
                )
            ],
        )
        created = await self._invoices.create(invoice)
        await self._clinical.mark_charges_invoiced([charge.id for charge in charges], created.id)
        return created
