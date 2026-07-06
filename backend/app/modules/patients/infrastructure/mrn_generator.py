"""Postgres-sequence-backed `MrnGenerator` implementation.

Produces IDs like `MRN-000123`. Backed by a database `SEQUENCE`
(`patient_mrn_seq`, created by the Patients migration) so concurrent
registrations can never race for the same number — `nextval()` is atomic
at the database level. Mirrors `SqlAlchemyUhidGenerator`.
"""

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

_SEQUENCE_NAME = "patient_mrn_seq"
_MRN_PREFIX = "MRN"


class SqlAlchemyMrnGenerator:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def generate(self) -> str:
        result = await self._session.execute(text(f"SELECT nextval('{_SEQUENCE_NAME}')"))
        sequence_value = result.scalar_one()
        return f"{_MRN_PREFIX}-{sequence_value:06d}"
