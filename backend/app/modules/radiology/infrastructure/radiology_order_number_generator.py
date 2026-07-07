from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.radiology.application.interfaces.radiology_order_number_generator import (
    RadiologyOrderNumberGenerator,
)


class SqlAlchemyRadiologyOrderNumberGenerator(RadiologyOrderNumberGenerator):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def generate(self) -> str:
        result = await self._session.execute(text("SELECT nextval('radiology_order_number_seq')"))
        sequence = int(result.scalar_one())
        return f"RAD-{sequence:06d}"
