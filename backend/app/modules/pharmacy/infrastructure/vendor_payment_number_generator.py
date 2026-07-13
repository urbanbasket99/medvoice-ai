from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.pharmacy.application.interfaces.vendor_payment_number_generator import (
    VendorPaymentNumberGenerator,
)


class SqlAlchemyVendorPaymentNumberGenerator(VendorPaymentNumberGenerator):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def generate(self) -> str:
        result = await self._session.execute(text("SELECT nextval('pharmacy_vendor_payment_number_seq')"))
        sequence = int(result.scalar_one())
        return f"VP-{sequence:06d}"
