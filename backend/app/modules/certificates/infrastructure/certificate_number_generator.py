from datetime import datetime

from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.certificates.application.interfaces.certificate_number_generator import (
    CertificateNumberGenerator,
)
from app.modules.certificates.infrastructure.models.medical_certificate_model import (
    MedicalCertificateModel,
)


class SqlAlchemyCertificateNumberGenerator(CertificateNumberGenerator):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def generate(self) -> str:
        year = datetime.now().year
        prefix = f"MC-{year}-"
        # Lock matching rows for the year so concurrent creates don't collide.
        await self._session.execute(
            text(
                "SELECT id FROM medical_certificates "
                "WHERE certificate_number LIKE :pattern FOR UPDATE"
            ),
            {"pattern": f"{prefix}%"},
        )
        result = await self._session.execute(
            select(func.max(MedicalCertificateModel.certificate_number)).where(
                MedicalCertificateModel.certificate_number.like(f"{prefix}%")
            )
        )
        max_number = result.scalar_one_or_none()
        if max_number is None:
            seq = 1
        else:
            try:
                seq = int(str(max_number).rsplit("-", 1)[-1]) + 1
            except ValueError:
                seq = 1
        return f"{prefix}{seq:04d}"
