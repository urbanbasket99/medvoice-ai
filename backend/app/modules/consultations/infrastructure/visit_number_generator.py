from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.consultations.application.interfaces.visit_number_generator import VisitNumberGenerator


class SqlAlchemyVisitNumberGenerator(VisitNumberGenerator):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def generate(self) -> str:
        result = await self._session.execute(text("SELECT nextval('consultation_visit_number_seq')"))
        sequence_value = int(result.scalar_one())
        return f"VIS-{sequence_value:06d}"
