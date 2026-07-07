from datetime import UTC, datetime
from decimal import Decimal
from uuid import uuid4

from app.modules.billing.application.dto.billing_dto import PaymentInput
from app.modules.billing.application.interfaces.payment_number_generator import PaymentNumberGenerator
from app.modules.billing.domain.entities.billing_entities import Payment
from app.modules.billing.domain.exceptions import InvoiceNotFoundError, PaymentExceedsBalanceError
from app.modules.billing.domain.repositories.invoice_repository import InvoiceRepository
from app.modules.billing.domain.repositories.payment_repository import PaymentRepository
from app.modules.billing.domain.value_objects import InvoiceStatus


class CreatePaymentUseCase:
    def __init__(
        self,
        invoice_repository: InvoiceRepository,
        payment_repository: PaymentRepository,
        payment_number_generator: PaymentNumberGenerator,
    ) -> None:
        self._invoices = invoice_repository
        self._payments = payment_repository
        self._payment_numbers = payment_number_generator

    async def execute(self, data: PaymentInput) -> Payment:
        invoice = await self._invoices.get_by_id(data.invoice_id)
        if invoice is None:
            raise InvoiceNotFoundError("Invoice not found.")

        if data.amount > invoice.balance:
            raise PaymentExceedsBalanceError(
                f"Payment amount {data.amount} exceeds outstanding balance {invoice.balance}."
            )

        now = datetime.now(UTC)
        payment_number = await self._payment_numbers.generate()

        payment = Payment(
            id=uuid4(),
            invoice_id=data.invoice_id,
            payment_number=payment_number,
            amount=data.amount,
            payment_method=data.payment_method,
            payment_date=data.payment_date,
            reference_number=data.reference_number,
            collected_by=data.collected_by,
            notes=data.notes,
            created_at=now,
        )
        created_payment = await self._payments.create(payment)

        new_paid = invoice.paid_amount + data.amount
        new_balance = invoice.grand_total - new_paid
        if new_balance <= Decimal("0"):
            new_status = InvoiceStatus.PAID
        elif new_paid > Decimal("0"):
            new_status = InvoiceStatus.PARTIALLY_PAID
        else:
            new_status = invoice.status

        invoice.paid_amount = new_paid
        invoice.balance = max(Decimal("0"), new_balance)
        invoice.status = new_status
        invoice.updated_at = now
        await self._invoices.update(invoice)

        return created_payment
