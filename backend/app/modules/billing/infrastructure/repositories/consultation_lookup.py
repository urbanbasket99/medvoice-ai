from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.billing.application.dto.billing_dto import ConsultationContext
from app.modules.billing.application.interfaces.consultation_lookup import ConsultationLookup
from app.modules.consultations.infrastructure.models.consultation_model import ConsultationModel


class SqlAlchemyConsultationLookup(ConsultationLookup):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_consultation_context(self, consultation_id: UUID) -> ConsultationContext | None:
        result = await self._session.execute(
            select(ConsultationModel).where(
                ConsultationModel.id == consultation_id,
                ConsultationModel.deleted_at.is_(None),
            )
        )
        model = result.scalar_one_or_none()
        if model is None:
            return None
        return ConsultationContext(
            consultation_id=model.id,
            patient_id=model.patient_id,
            doctor_id=model.doctor_id,
            visit_number=model.visit_number,
        )
