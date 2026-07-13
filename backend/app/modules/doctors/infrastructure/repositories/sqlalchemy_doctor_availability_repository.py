from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.doctors.domain.entities.doctor_availability_slot import DoctorAvailabilitySlot
from app.modules.doctors.domain.repositories.doctor_availability_repository import (
    DoctorAvailabilityRepository,
)
from app.modules.doctors.infrastructure.models.doctor_availability_slot_model import (
    DoctorAvailabilitySlotModel,
)


def _to_entity(model: DoctorAvailabilitySlotModel) -> DoctorAvailabilitySlot:
    return DoctorAvailabilitySlot(
        id=model.id,
        doctor_id=model.doctor_id,
        day_of_week=model.day_of_week,
        start_time=model.start_time,
        end_time=model.end_time,
        slot_minutes=model.slot_minutes,
        is_active=model.is_active,
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


class SqlAlchemyDoctorAvailabilityRepository(DoctorAvailabilityRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_by_doctor(self, doctor_id: UUID) -> list[DoctorAvailabilitySlot]:
        result = await self._session.execute(
            select(DoctorAvailabilitySlotModel)
            .where(DoctorAvailabilitySlotModel.doctor_id == doctor_id)
            .order_by(
                DoctorAvailabilitySlotModel.day_of_week,
                DoctorAvailabilitySlotModel.start_time,
            )
        )
        return [_to_entity(m) for m in result.scalars().all()]

    async def replace_all(
        self, doctor_id: UUID, slots: list[DoctorAvailabilitySlot]
    ) -> list[DoctorAvailabilitySlot]:
        await self._session.execute(
            delete(DoctorAvailabilitySlotModel).where(
                DoctorAvailabilitySlotModel.doctor_id == doctor_id
            )
        )
        for slot in slots:
            self._session.add(
                DoctorAvailabilitySlotModel(
                    id=slot.id,
                    doctor_id=slot.doctor_id,
                    day_of_week=slot.day_of_week,
                    start_time=slot.start_time,
                    end_time=slot.end_time,
                    slot_minutes=slot.slot_minutes,
                    is_active=slot.is_active,
                )
            )
        await self._session.flush()
        return await self.list_by_doctor(doctor_id)
