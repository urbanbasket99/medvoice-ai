"""Postgres-sequence-backed `UhidGenerator` implementation.

Produces IDs like `MVH-2026-000123`. Using a database `SEQUENCE`
(`patient_uhid_seq`, created by the Patients migration) rather than
counting rows means concurrent registrations can never race for the same
number — `nextval()` is atomic at the database level.
"""

from datetime import UTC, datetime

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

_SEQUENCE_NAME = "patient_uhid_seq"
_UHID_PREFIX = "MVH"


class SqlAlchemyUhidGenerator:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def generate(self) -> str:
        result = await self._session.execute(text(f"SELECT nextval('{_SEQUENCE_NAME}')"))
        sequence_value = result.scalar_one()
        year = datetime.now(UTC).year
        return f"{_UHID_PREFIX}-{year}-{sequence_value:06d}"
