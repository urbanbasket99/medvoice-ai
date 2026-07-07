from datetime import datetime

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.appointments.application.interfaces.appointment_number_generator import (
    AppointmentNumberGenerator,
)


class SqlAlchemyAppointmentNumberGenerator(AppointmentNumberGenerator):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def generate(self) -> str:
        result = await self._session.execute(text("SELECT nextval('appointment_number_seq')"))
        sequence_value = result.scalar_one()
        return f"APT-{int(sequence_value):06d}"
