from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.billing.application.interfaces.payment_number_generator import PaymentNumberGenerator


class SqlAlchemyPaymentNumberGenerator(PaymentNumberGenerator):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def generate(self) -> str:
        result = await self._session.execute(text("SELECT nextval('billing_payment_number_seq')"))
        sequence = int(result.scalar_one())
        return f"PAY-{sequence:06d}"
