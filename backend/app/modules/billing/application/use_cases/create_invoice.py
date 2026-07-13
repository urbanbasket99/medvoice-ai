from datetime import UTC, datetime
from decimal import Decimal
from uuid import UUID, uuid4

from app.modules.billing.application.dto.billing_dto import CreateInvoiceInput, InvoiceItemInput
from app.modules.billing.application.interfaces.consultation_lookup import ConsultationLookup
from app.modules.billing.application.interfaces.invoice_number_generator import InvoiceNumberGenerator
from app.modules.billing.domain.entities.billing_entities import Invoice, InvoiceItem, InvoiceStatusEvent
from app.modules.billing.domain.exceptions import InvoiceConsultationNotFoundError
from app.modules.billing.domain.repositories.invoice_repository import InvoiceRepository
from app.modules.billing.domain.value_objects import InvoiceStatus


def _build_items(invoice_id: UUID, items: tuple[InvoiceItemInput, ...]) -> list[InvoiceItem]:
    built: list[InvoiceItem] = []
    for index, item in enumerate(items):
        total = item.quantity * item.unit_price - item.discount_amount + item.tax_amount
        built.append(
            InvoiceItem(
                id=uuid4(),
                invoice_id=invoice_id,
                service_name=item.service_name,
                department=item.department,
                quantity=item.quantity,
                unit_price=item.unit_price,
                discount_amount=item.discount_amount,
                tax_amount=item.tax_amount,
                total_amount=total,
                sort_order=item.sort_order if item.sort_order else index,
                reference_type=item.reference_type,
                reference_id=item.reference_id,
            )
        )
    return built


def _calculate_totals(
    items: list[InvoiceItem],
    discount_amount: Decimal,
    tax_amount: Decimal,
) -> tuple[Decimal, Decimal]:
    """Returns (subtotal, grand_total)."""
    subtotal = sum((i.quantity * i.unit_price for i in items), Decimal("0"))
    grand_total = subtotal - discount_amount + tax_amount
    return subtotal, grand_total


class CreateInvoiceUseCase:
    def __init__(
        self,
        invoice_repository: InvoiceRepository,
        consultation_lookup: ConsultationLookup,
        invoice_number_generator: InvoiceNumberGenerator,
    ) -> None:
        self._invoices = invoice_repository
        self._consultations = consultation_lookup
        self._invoice_numbers = invoice_number_generator

    async def execute(self, data: CreateInvoiceInput) -> Invoice:
        context = await self._consultations.get_consultation_context(data.consultation_id)
        if context is None:
            raise InvoiceConsultationNotFoundError("The selected consultation does not exist.")

        now = datetime.now(UTC)
        invoice_id = uuid4()
        invoice_number = await self._invoice_numbers.generate()
        initial_status = InvoiceStatus.DRAFT
        items = _build_items(invoice_id, data.items)
        subtotal, grand_total = _calculate_totals(items, data.discount_amount, data.tax_amount)

        invoice = Invoice(
            id=invoice_id,
            invoice_number=invoice_number,
            consultation_id=context.consultation_id,
            patient_id=context.patient_id,
            doctor_id=context.doctor_id,
            invoice_date=data.invoice_date,
            status=initial_status,
            subtotal=subtotal,
            discount_amount=data.discount_amount,
            tax_amount=data.tax_amount,
            grand_total=grand_total,
            paid_amount=Decimal("0"),
            balance=grand_total,
            notes=data.notes,
            is_provisional=data.is_provisional,
            is_tpa=data.is_tpa,
            tpa_id=data.tpa_id,
            created_at=now,
            updated_at=now,
            items=items,
            status_events=[
                InvoiceStatusEvent(
                    id=uuid4(),
                    invoice_id=invoice_id,
                    status=initial_status,
                    notes="Invoice created.",
                    changed_at=now,
                )
            ],
        )
        return await self._invoices.create(invoice)
