from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.pharmacy.application.interfaces.pharmacy_dispense_number_generator import (
    PharmacyDispenseNumberGenerator,
)


class SqlAlchemyPharmacyDispenseNumberGenerator(PharmacyDispenseNumberGenerator):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def generate(self) -> str:
        result = await self._session.execute(text("SELECT nextval('pharmacy_dispense_number_seq')"))
        sequence = int(result.scalar_one())
        return f"PHR-{sequence:06d}"
