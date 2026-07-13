from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.ipd.application.interfaces.admission_number_generator import (
    AdmissionNumberGenerator,
)


class SqlAlchemyAdmissionNumberGenerator(AdmissionNumberGenerator):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def generate(self) -> str:
        result = await self._session.execute(text("SELECT nextval('ipd_admission_number_seq')"))
        seq = int(result.scalar_one())
        return f"IPD-{seq:06d}"
