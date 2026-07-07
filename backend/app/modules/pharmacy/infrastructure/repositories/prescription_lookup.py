from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.pharmacy.application.dto.pharmacy_dto import PrescriptionContext, PrescriptionItemContext
from app.modules.pharmacy.application.interfaces.prescription_lookup import PrescriptionLookup
from app.modules.prescriptions.infrastructure.models.prescription_model import PrescriptionModel


class SqlAlchemyPrescriptionLookup(PrescriptionLookup):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_prescription_context(self, prescription_id: UUID) -> PrescriptionContext | None:
        result = await self._session.execute(
            select(PrescriptionModel)
            .options(selectinload(PrescriptionModel.items))
            .where(
                PrescriptionModel.id == prescription_id,
                PrescriptionModel.deleted_at.is_(None),
            )
        )
        model = result.scalar_one_or_none()
        if model is None:
            return None

        items = tuple(
            PrescriptionItemContext(
                id=item.id,
                medicine_name=item.medicine_name,
                quantity=item.quantity,
                instructions=item.instructions,
                medicine_master_id=item.medicine_master_id,
                strength=item.strength,
            )
            for item in model.items
        )

        return PrescriptionContext(
            prescription_id=model.id,
            consultation_id=model.consultation_id,
            patient_id=model.patient_id,
            doctor_id=model.doctor_id,
            items=items,
        )
