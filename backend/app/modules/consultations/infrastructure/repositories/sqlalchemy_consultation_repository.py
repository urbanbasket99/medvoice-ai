from datetime import date
from uuid import UUID

from sqlalchemy import String, and_, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased

from app.modules.appointments.infrastructure.models.appointment_model import AppointmentModel
from app.modules.consultations.domain.entities.consultation import Consultation, ConsultationStatus
from app.modules.consultations.domain.repositories.consultation_repository import (
    AppointmentSnapshot,
    ConsultationRepository,
)
from app.modules.consultations.domain.value_objects import ConsultationListCriteria, ConsultationPage, SortDirection
from app.modules.consultations.infrastructure.models.consultation_model import ConsultationModel
from app.modules.consultations.infrastructure.repositories.mappers import (
    _vital_signs_to_json,
    consultation_to_entity,
)
from app.modules.doctors.infrastructure.models.doctor_model import DoctorModel
from app.modules.patients.infrastructure.models.patient_model import PatientModel

_SORT_COLUMNS = {
    "created_at": ConsultationModel.created_at,
    "visit_number": ConsultationModel.visit_number,
    "status": ConsultationModel.status,
    "follow_up_date": ConsultationModel.follow_up_date,
}


class SqlAlchemyConsultationRepository(ConsultationRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    def _base_select(self):
        patient = aliased(PatientModel)
        doctor = aliased(DoctorModel)
        appointment = aliased(AppointmentModel)
        stmt = (
            select(ConsultationModel, patient, doctor, appointment)
            .join(patient, ConsultationModel.patient_id == patient.id)
            .join(doctor, ConsultationModel.doctor_id == doctor.id)
            .join(appointment, ConsultationModel.appointment_id == appointment.id)
        )
        return stmt, patient, doctor, appointment

    def _map_row(self, row) -> Consultation:
        model, patient, doctor, appointment = row
        return consultation_to_entity(model, patient, doctor, appointment)

    async def get_by_id(self, consultation_id: UUID) -> Consultation | None:
        stmt, _, _, _ = self._base_select()
        result = await self._session.execute(
            stmt.where(
                ConsultationModel.id == consultation_id,
                ConsultationModel.deleted_at.is_(None),
            )
        )
        row = result.first()
        return self._map_row(row) if row else None

    async def get_by_appointment_id(self, appointment_id: UUID) -> Consultation | None:
        stmt, _, _, _ = self._base_select()
        result = await self._session.execute(
            stmt.where(
                ConsultationModel.appointment_id == appointment_id,
                ConsultationModel.deleted_at.is_(None),
            )
        )
        row = result.first()
        return self._map_row(row) if row else None

    async def appointment_exists(self, appointment_id: UUID) -> bool:
        result = await self._session.execute(
            select(AppointmentModel.id).where(
                AppointmentModel.id == appointment_id,
                AppointmentModel.deleted_at.is_(None),
            )
        )
        return result.scalar_one_or_none() is not None

    async def get_appointment_snapshot(self, appointment_id: UUID) -> AppointmentSnapshot | None:
        result = await self._session.execute(
            select(AppointmentModel).where(
                AppointmentModel.id == appointment_id,
                AppointmentModel.deleted_at.is_(None),
            )
        )
        model = result.scalar_one_or_none()
        if model is None:
            return None
        return AppointmentSnapshot(
            id=model.id,
            patient_id=model.patient_id,
            doctor_id=model.doctor_id,
            chief_complaint=model.chief_complaint,
        )

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

    async def get_patient_allergies(self, patient_id: UUID) -> str | None:
        result = await self._session.execute(
            select(PatientModel.allergies).where(
                PatientModel.id == patient_id, PatientModel.deleted_at.is_(None)
            )
        )
        return result.scalar_one_or_none()

    async def create(self, consultation: Consultation) -> Consultation:
        model = ConsultationModel(
            id=consultation.id,
            visit_number=consultation.visit_number,
            appointment_id=consultation.appointment_id,
            patient_id=consultation.patient_id,
            doctor_id=consultation.doctor_id,
            chief_complaint=consultation.chief_complaint,
            history_of_present_illness=consultation.history_of_present_illness,
            past_medical_history=consultation.past_medical_history,
            family_history=consultation.family_history,
            allergies=consultation.allergies,
            current_medications=consultation.current_medications,
            vital_signs=_vital_signs_to_json(consultation.vital_signs),
            physical_examination=consultation.physical_examination,
            diagnosis=consultation.diagnosis,
            assessment=consultation.assessment,
            treatment_plan=consultation.treatment_plan,
            doctor_notes=consultation.doctor_notes,
            follow_up_date=consultation.follow_up_date,
            status=consultation.status.value,
        )
        self._session.add(model)
        await self._session.flush()
        created = await self.get_by_id(model.id)
        assert created is not None
        return created

    async def update(self, consultation: Consultation) -> Consultation:
        await self._session.execute(
            update(ConsultationModel)
            .where(ConsultationModel.id == consultation.id)
            .values(
                chief_complaint=consultation.chief_complaint,
                history_of_present_illness=consultation.history_of_present_illness,
                past_medical_history=consultation.past_medical_history,
                family_history=consultation.family_history,
                allergies=consultation.allergies,
                current_medications=consultation.current_medications,
                vital_signs=_vital_signs_to_json(consultation.vital_signs),
                physical_examination=consultation.physical_examination,
                diagnosis=consultation.diagnosis,
                assessment=consultation.assessment,
                treatment_plan=consultation.treatment_plan,
                doctor_notes=consultation.doctor_notes,
                follow_up_date=consultation.follow_up_date,
                status=consultation.status.value,
            )
        )
        updated = await self.get_by_id(consultation.id)
        assert updated is not None
        return updated

    async def soft_delete(self, consultation_id: UUID) -> bool:
        result = await self._session.execute(
            update(ConsultationModel)
            .where(ConsultationModel.id == consultation_id, ConsultationModel.deleted_at.is_(None))
            .values(deleted_at=func.now(), status=ConsultationStatus.CANCELLED.value)
        )
        return (result.rowcount or 0) > 0

    async def list_consultations(self, criteria: ConsultationListCriteria) -> ConsultationPage:
        stmt, _, _, appointment = self._base_select()
        conditions = [ConsultationModel.deleted_at.is_(None)]

        if criteria.status is not None:
            conditions.append(ConsultationModel.status == criteria.status.value)
        if criteria.patient_id is not None:
            conditions.append(ConsultationModel.patient_id == criteria.patient_id)
        if criteria.doctor_id is not None:
            conditions.append(ConsultationModel.doctor_id == criteria.doctor_id)
        if criteria.appointment_id is not None:
            conditions.append(ConsultationModel.appointment_id == criteria.appointment_id)
        if criteria.date_from is not None:
            conditions.append(func.date(ConsultationModel.created_at) >= criteria.date_from)
        if criteria.date_to is not None:
            conditions.append(func.date(ConsultationModel.created_at) <= criteria.date_to)

        sort_column = _SORT_COLUMNS.get(criteria.sort_by.value, ConsultationModel.created_at)
        order = sort_column.asc() if criteria.sort_dir == SortDirection.ASC else sort_column.desc()

        count_stmt = select(func.count()).select_from(ConsultationModel).where(and_(*conditions))
        total = (await self._session.execute(count_stmt)).scalar_one()

        offset = (criteria.page - 1) * criteria.page_size
        result = await self._session.execute(
            stmt.where(and_(*conditions)).order_by(order).offset(offset).limit(criteria.page_size)
        )
        items = [self._map_row(row) for row in result.all()]
        return ConsultationPage(items=items, total=total, page=criteria.page, page_size=criteria.page_size)

    async def search_consultations(self, query: str, page: int, page_size: int) -> ConsultationPage:
        stmt, patient, doctor, appointment = self._base_select()
        pattern = f"%{query}%"
        conditions = and_(
            ConsultationModel.deleted_at.is_(None),
            or_(
                ConsultationModel.visit_number.ilike(pattern),
                ConsultationModel.chief_complaint.ilike(pattern),
                ConsultationModel.diagnosis.ilike(pattern),
                ConsultationModel.assessment.ilike(pattern),
                patient.first_name.ilike(pattern),
                patient.last_name.ilike(pattern),
                patient.mrn.ilike(pattern),
                patient.uhid.ilike(pattern),
                doctor.full_name.ilike(pattern),
                doctor.doctor_code.ilike(pattern),
                appointment.appointment_number.ilike(pattern),
            ),
        )

        total = (
            await self._session.execute(
                select(func.count())
                .select_from(ConsultationModel)
                .join(patient, ConsultationModel.patient_id == patient.id)
                .join(doctor, ConsultationModel.doctor_id == doctor.id)
                .join(appointment, ConsultationModel.appointment_id == appointment.id)
                .where(conditions)
            )
        ).scalar_one()

        offset = (page - 1) * page_size
        result = await self._session.execute(
            stmt.where(conditions)
            .order_by(ConsultationModel.created_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        items = [self._map_row(row) for row in result.all()]
        return ConsultationPage(items=items, total=total, page=page, page_size=page_size)

    async def count_by_status_and_date(
        self, *, status: str | None = None, date_from: date | None = None, date_to: date | None = None
    ) -> int:
        conditions = [ConsultationModel.deleted_at.is_(None)]
        if status is not None:
            conditions.append(ConsultationModel.status == status)
        if date_from is not None:
            conditions.append(func.date(ConsultationModel.created_at) >= date_from)
        if date_to is not None:
            conditions.append(func.date(ConsultationModel.created_at) <= date_to)
        result = await self._session.execute(
            select(func.count()).select_from(ConsultationModel).where(and_(*conditions))
        )
        return int(result.scalar_one())
