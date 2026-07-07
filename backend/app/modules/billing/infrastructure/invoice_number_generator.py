from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.billing.application.interfaces.invoice_number_generator import InvoiceNumberGenerator


class SqlAlchemyInvoiceNumberGenerator(InvoiceNumberGenerator):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def generate(self) -> str:
        result = await self._session.execute(text("SELECT nextval('billing_invoice_number_seq')"))
        sequence = int(result.scalar_one())
        return f"INV-{sequence:06d}"
