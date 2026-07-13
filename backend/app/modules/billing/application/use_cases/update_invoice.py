from datetime import UTC, datetime
from decimal import Decimal
from uuid import UUID, uuid4

from app.modules.billing.application.dto.billing_dto import InvoiceItemInput, UpdateInvoiceInput
from app.modules.billing.domain.entities.billing_entities import Invoice, InvoiceItem
from app.modules.billing.domain.exceptions import InvoiceNotFoundError
from app.modules.billing.domain.repositories.invoice_repository import InvoiceRepository


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


class UpdateInvoiceUseCase:
    def __init__(self, invoice_repository: InvoiceRepository) -> None:
        self._invoices = invoice_repository

    async def execute(self, invoice_id: UUID, data: UpdateInvoiceInput) -> Invoice:
        existing = await self._invoices.get_by_id(invoice_id)
        if existing is None:
            raise InvoiceNotFoundError("Invoice not found.")

        items = _build_items(invoice_id, data.items)
        subtotal = sum((i.quantity * i.unit_price for i in items), Decimal("0"))
        grand_total = subtotal - data.discount_amount + data.tax_amount
        balance = grand_total - existing.paid_amount

        existing.invoice_date = data.invoice_date
        existing.notes = data.notes
        existing.items = items
        existing.discount_amount = data.discount_amount
        existing.tax_amount = data.tax_amount
        existing.subtotal = subtotal
        existing.grand_total = grand_total
        existing.balance = balance
        existing.is_provisional = data.is_provisional
        existing.is_tpa = data.is_tpa
        existing.tpa_id = data.tpa_id
        existing.updated_at = datetime.now(UTC)
        return await self._invoices.update(existing)
