from datetime import date

from app.modules.billing.domain.repositories.invoice_repository import InvoiceRepository
from app.modules.billing.domain.value_objects import CollectionReportGroupBy, CollectionReportRow


class GetCollectionReportUseCase:
    def __init__(self, invoice_repository: InvoiceRepository) -> None:
        self._invoices = invoice_repository

    async def execute(
        self,
        date_from: date,
        date_to: date,
        group_by: CollectionReportGroupBy,
    ) -> list[CollectionReportRow]:
        return await self._invoices.get_collection_report(date_from, date_to, group_by)
