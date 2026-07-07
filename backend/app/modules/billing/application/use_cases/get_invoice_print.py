from uuid import UUID

from app.modules.billing.application.dto.billing_dto import InvoiceItemPrint, InvoicePrintOutput
from app.modules.billing.domain.exceptions import InvoiceNotFoundError
from app.modules.billing.domain.repositories.invoice_repository import InvoiceRepository


class GetInvoicePrintUseCase:
    def __init__(self, invoice_repository: InvoiceRepository) -> None:
        self._invoices = invoice_repository

    async def execute(self, invoice_id: UUID) -> InvoicePrintOutput:
        invoice = await self._invoices.get_by_id(invoice_id)
        if invoice is None:
            raise InvoiceNotFoundError("Invoice not found.")

        items = [
            InvoiceItemPrint(
                service_name=item.service_name,
                department=item.department.value,
                quantity=item.quantity,
                unit_price=item.unit_price,
                discount_amount=item.discount_amount,
                tax_amount=item.tax_amount,
                total_amount=item.total_amount,
                sort_order=item.sort_order,
            )
            for item in sorted(invoice.items or [], key=lambda row: row.sort_order)
        ]

        return InvoicePrintOutput(
            invoice_id=invoice.id,
            invoice_number=invoice.invoice_number,
            consultation_id=invoice.consultation_id,
            invoice_date=invoice.invoice_date,
            status=invoice.status.value,
            subtotal=invoice.subtotal,
            discount_amount=invoice.discount_amount,
            tax_amount=invoice.tax_amount,
            grand_total=invoice.grand_total,
            paid_amount=invoice.paid_amount,
            balance=invoice.balance,
            notes=invoice.notes,
            patient_name=invoice.patient_name,
            patient_mrn=invoice.patient_mrn,
            patient_uhid=invoice.patient_uhid,
            patient_gender=invoice.patient_gender,
            patient_date_of_birth=invoice.patient_date_of_birth,
            doctor_name=invoice.doctor_name,
            doctor_code=invoice.doctor_code,
            doctor_specialization=invoice.doctor_specialization,
            consultation_visit_number=invoice.consultation_visit_number,
            items=items,
            created_at=invoice.created_at,
        )
