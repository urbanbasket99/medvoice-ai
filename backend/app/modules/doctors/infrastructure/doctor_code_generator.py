"""Postgres-sequence-backed `DoctorCodeGenerator` implementation.

Produces IDs like `DOC-000123`. Using a database `SEQUENCE`
(`doctor_code_seq`, created by the Doctors migration) rather than counting
rows means concurrent registrations can never race for the same number —
`nextval()` is atomic at the database level. Mirrors
`app.modules.patients.infrastructure.mrn_generator.SqlAlchemyMrnGenerator`.
"""

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

_SEQUENCE_NAME = "doctor_code_seq"
_DOCTOR_CODE_PREFIX = "DOC"


class SqlAlchemyDoctorCodeGenerator:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def generate(self) -> str:
        result = await self._session.execute(text(f"SELECT nextval('{_SEQUENCE_NAME}')"))
        sequence_value = result.scalar_one()
        return f"{_DOCTOR_CODE_PREFIX}-{sequence_value:06d}"
