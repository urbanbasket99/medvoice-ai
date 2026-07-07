from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.laboratory.application.interfaces.lab_order_number_generator import LabOrderNumberGenerator


class SqlAlchemyLabOrderNumberGenerator(LabOrderNumberGenerator):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def generate(self) -> str:
        result = await self._session.execute(text("SELECT nextval('lab_order_number_seq')"))
        sequence = int(result.scalar_one())
        return f"LAB-{sequence:06d}"
