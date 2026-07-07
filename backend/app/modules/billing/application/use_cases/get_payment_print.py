from uuid import UUID

from app.modules.billing.application.dto.billing_dto import PaymentPrintOutput
from app.modules.billing.domain.exceptions import InvoiceNotFoundError, PaymentNotFoundError
from app.modules.billing.domain.repositories.invoice_repository import InvoiceRepository
from app.modules.billing.domain.repositories.payment_repository import PaymentRepository


class GetPaymentPrintUseCase:
    def __init__(
        self,
        payment_repository: PaymentRepository,
        invoice_repository: InvoiceRepository,
    ) -> None:
        self._payments = payment_repository
        self._invoices = invoice_repository

    async def execute(self, payment_id: UUID) -> PaymentPrintOutput:
        payment = await self._payments.get_by_id(payment_id)
        if payment is None:
            raise PaymentNotFoundError("Payment not found.")

        invoice = await self._invoices.get_by_id(payment.invoice_id)
        if invoice is None:
            raise InvoiceNotFoundError("Invoice not found.")

        return PaymentPrintOutput(
            payment_id=payment.id,
            payment_number=payment.payment_number,
            invoice_id=invoice.id,
            invoice_number=invoice.invoice_number,
            amount=payment.amount,
            payment_method=payment.payment_method.value,
            payment_date=payment.payment_date,
            reference_number=payment.reference_number,
            notes=payment.notes,
            patient_name=invoice.patient_name,
            patient_mrn=invoice.patient_mrn,
            doctor_name=invoice.doctor_name,
            consultation_visit_number=invoice.consultation_visit_number,
            created_at=payment.created_at,
        )
