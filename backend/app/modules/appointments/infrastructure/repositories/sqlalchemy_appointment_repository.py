from datetime import date, time
from uuid import UUID

from sqlalchemy import String, and_, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased

from app.modules.appointments.domain.entities.appointment import Appointment, AppointmentStatus
from app.modules.appointments.domain.repositories.appointment_repository import AppointmentRepository
from app.modules.appointments.domain.value_objects import (
    AppointmentListCriteria,
    AppointmentPage,
    SortDirection,
)
from app.modules.appointments.infrastructure.models.appointment_model import AppointmentModel
from app.modules.appointments.infrastructure.repositories.mappers import appointment_to_entity
from app.modules.doctors.infrastructure.models.doctor_model import DoctorModel
from app.modules.patients.infrastructure.models.patient_model import PatientModel

_SORT_COLUMNS = {
    "created_at": AppointmentModel.created_at,
    "appointment_date": AppointmentModel.appointment_date,
    "appointment_time": AppointmentModel.appointment_time,
    "token_number": AppointmentModel.token_number,
    "status": AppointmentModel.status,
    "priority": AppointmentModel.priority,
}

_ACTIVE_OVERLAP_STATUSES = {
    AppointmentStatus.SCHEDULED.value,
    AppointmentStatus.CONFIRMED.value,
    AppointmentStatus.CHECKED_IN.value,
    AppointmentStatus.IN_CONSULTATION.value,
}


def _time_to_minutes(value: time) -> int:
    return value.hour * 60 + value.minute


def _times_overlap(start_a: time, duration_a: int, start_b: time, duration_b: int) -> bool:
    end_a = _time_to_minutes(start_a) + duration_a
    end_b = _time_to_minutes(start_b) + duration_b
    return _time_to_minutes(start_a) < end_b and end_a > _time_to_minutes(start_b)


class SqlAlchemyAppointmentRepository(AppointmentRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    def _base_select(self):
        patient = aliased(PatientModel)
        doctor = aliased(DoctorModel)
        stmt = (
            select(AppointmentModel, patient, doctor)
            .join(patient, AppointmentModel.patient_id == patient.id)
            .join(doctor, AppointmentModel.doctor_id == doctor.id)
        )
        return stmt, patient, doctor

    def _map_row(self, row) -> Appointment:
        model, patient, doctor = row
        return appointment_to_entity(model, patient, doctor)

    async def get_by_id(self, appointment_id: UUID) -> Appointment | None:
        stmt, _, _ = self._base_select()
        result = await self._session.execute(
            stmt.where(
                AppointmentModel.id == appointment_id,
                AppointmentModel.deleted_at.is_(None),
            )
        )
        row = result.first()
        return self._map_row(row) if row else None

    async def get_by_number(self, appointment_number: str) -> Appointment | None:
        stmt, _, _ = self._base_select()
        result = await self._session.execute(
            stmt.where(
                AppointmentModel.appointment_number == appointment_number,
                AppointmentModel.deleted_at.is_(None),
            )
        )
        row = result.first()
        return self._map_row(row) if row else None

    async def patient_exists(self, patient_id: UUID) -> bool:
        result = await self._session.execute(
            select(PatientModel.id).where(
                PatientModel.id == patient_id, PatientModel.deleted_at.is_(None)
            )
        )
        return result.scalar_one_or_none() is not None

    async def doctor_exists(self, doctor_id: UUID) -> bool:
        result = await self._session.execute(
            select(DoctorModel.id).where(
                DoctorModel.id == doctor_id, DoctorModel.deleted_at.is_(None)
            )
        )
        return result.scalar_one_or_none() is not None

    async def get_doctor_department(self, doctor_id: UUID) -> str | None:
        result = await self._session.execute(
            select(DoctorModel.department).where(
                DoctorModel.id == doctor_id, DoctorModel.deleted_at.is_(None)
            )
        )
        return result.scalar_one_or_none()

    async def next_token_number(self, doctor_id: UUID, appointment_date: date) -> int:
        result = await self._session.execute(
            select(func.coalesce(func.max(AppointmentModel.token_number), 0)).where(
                AppointmentModel.doctor_id == doctor_id,
                AppointmentModel.appointment_date == appointment_date,
                AppointmentModel.deleted_at.is_(None),
            )
        )
        return int(result.scalar_one()) + 1

    async def has_overlapping_slot(
        self,
        doctor_id: UUID,
        appointment_date: date,
        appointment_time: time,
        duration_minutes: int,
        exclude_id: UUID | None = None,
    ) -> bool:
        conditions = [
            AppointmentModel.doctor_id == doctor_id,
            AppointmentModel.appointment_date == appointment_date,
            AppointmentModel.deleted_at.is_(None),
            AppointmentModel.status.in_(_ACTIVE_OVERLAP_STATUSES),
        ]
        if exclude_id is not None:
            conditions.append(AppointmentModel.id != exclude_id)

        result = await self._session.execute(select(AppointmentModel).where(and_(*conditions)))
        for existing in result.scalars().all():
            if _times_overlap(
                appointment_time,
                duration_minutes,
                existing.appointment_time,
                existing.duration_minutes,
            ):
                return True
        return False

    async def create(self, appointment: Appointment) -> Appointment:
        model = AppointmentModel(
            id=appointment.id,
            appointment_number=appointment.appointment_number,
            patient_id=appointment.patient_id,
            doctor_id=appointment.doctor_id,
            department=appointment.department.value,
            appointment_date=appointment.appointment_date,
            appointment_time=appointment.appointment_time,
            duration_minutes=appointment.duration_minutes,
            appointment_type=appointment.appointment_type.value,
            priority=appointment.priority.value,
            status=appointment.status.value,
            chief_complaint=appointment.chief_complaint,
            notes=appointment.notes,
            room=appointment.room,
            token_number=appointment.token_number,
        )
        self._session.add(model)
        await self._session.flush()
        created = await self.get_by_id(model.id)
        assert created is not None
        return created

    async def update(self, appointment: Appointment) -> Appointment:
        await self._session.execute(
            update(AppointmentModel)
            .where(AppointmentModel.id == appointment.id)
            .values(
                patient_id=appointment.patient_id,
                doctor_id=appointment.doctor_id,
                department=appointment.department.value,
                appointment_date=appointment.appointment_date,
                appointment_time=appointment.appointment_time,
                duration_minutes=appointment.duration_minutes,
                appointment_type=appointment.appointment_type.value,
                priority=appointment.priority.value,
                status=appointment.status.value,
                chief_complaint=appointment.chief_complaint,
                notes=appointment.notes,
                room=appointment.room,
                token_number=appointment.token_number,
            )
        )
        updated = await self.get_by_id(appointment.id)
        assert updated is not None
        return updated

    async def soft_delete(self, appointment_id: UUID) -> bool:
        result = await self._session.execute(
            update(AppointmentModel)
            .where(AppointmentModel.id == appointment_id, AppointmentModel.deleted_at.is_(None))
            .values(deleted_at=func.now(), status=AppointmentStatus.CANCELLED.value)
        )
        return (result.rowcount or 0) > 0

    async def list_appointments(self, criteria: AppointmentListCriteria) -> AppointmentPage:
        stmt, _, _ = self._base_select()
        conditions = [AppointmentModel.deleted_at.is_(None)]

        if criteria.status is not None:
            conditions.append(AppointmentModel.status == criteria.status.value)
        if criteria.priority is not None:
            conditions.append(AppointmentModel.priority == criteria.priority.value)
        if criteria.appointment_type is not None:
            conditions.append(AppointmentModel.appointment_type == criteria.appointment_type.value)
        if criteria.department is not None:
            conditions.append(AppointmentModel.department == criteria.department.value)
        if criteria.patient_id is not None:
            conditions.append(AppointmentModel.patient_id == criteria.patient_id)
        if criteria.doctor_id is not None:
            conditions.append(AppointmentModel.doctor_id == criteria.doctor_id)
        if criteria.date_from is not None:
            conditions.append(AppointmentModel.appointment_date >= criteria.date_from)
        if criteria.date_to is not None:
            conditions.append(AppointmentModel.appointment_date <= criteria.date_to)

        sort_column = _SORT_COLUMNS.get(criteria.sort_by.value, AppointmentModel.appointment_date)
        order = sort_column.asc() if criteria.sort_dir == SortDirection.ASC else sort_column.desc()

        count_stmt = select(func.count()).select_from(AppointmentModel).where(and_(*conditions))
        total = (await self._session.execute(count_stmt)).scalar_one()

        offset = (criteria.page - 1) * criteria.page_size
        result = await self._session.execute(
            stmt.where(and_(*conditions)).order_by(order).offset(offset).limit(criteria.page_size)
        )
        items = [self._map_row(row) for row in result.all()]
        return AppointmentPage(items=items, total=total, page=criteria.page, page_size=criteria.page_size)

    async def search_appointments(self, query: str, page: int, page_size: int) -> AppointmentPage:
        stmt, patient, doctor = self._base_select()
        pattern = f"%{query}%"
        conditions = and_(
            AppointmentModel.deleted_at.is_(None),
            or_(
                AppointmentModel.appointment_number.ilike(pattern),
                AppointmentModel.chief_complaint.ilike(pattern),
                AppointmentModel.room.ilike(pattern),
                func.cast(AppointmentModel.token_number, String).ilike(pattern),
                patient.first_name.ilike(pattern),
                patient.last_name.ilike(pattern),
                patient.uhid.ilike(pattern),
                doctor.full_name.ilike(pattern),
                doctor.doctor_code.ilike(pattern),
            ),
        )

        total = (
            await self._session.execute(
                select(func.count())
                .select_from(AppointmentModel)
                .join(patient, AppointmentModel.patient_id == patient.id)
                .join(doctor, AppointmentModel.doctor_id == doctor.id)
                .where(conditions)
            )
        ).scalar_one()

        offset = (page - 1) * page_size
        result = await self._session.execute(
            stmt.where(conditions)
            .order_by(AppointmentModel.appointment_date.desc(), AppointmentModel.appointment_time.desc())
            .offset(offset)
            .limit(page_size)
        )
        items = [self._map_row(row) for row in result.all()]
        return AppointmentPage(items=items, total=total, page=page, page_size=page_size)
