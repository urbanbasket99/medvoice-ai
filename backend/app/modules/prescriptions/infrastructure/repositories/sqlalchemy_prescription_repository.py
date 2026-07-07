from uuid import UUID

from sqlalchemy import and_, delete, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased, selectinload

from app.modules.consultations.infrastructure.models.consultation_model import ConsultationModel
from app.modules.doctors.infrastructure.models.doctor_model import DoctorModel
from app.modules.patients.infrastructure.models.patient_model import PatientModel
from app.modules.prescriptions.domain.entities.prescription import Prescription
from app.modules.prescriptions.domain.repositories.prescription_repository import PrescriptionRepository
from app.modules.prescriptions.domain.value_objects import PrescriptionListCriteria, PrescriptionPage, SortDirection
from app.modules.prescriptions.infrastructure.models.prescription_model import PrescriptionItemModel, PrescriptionModel
from app.modules.prescriptions.infrastructure.repositories.mappers import (
    prescription_item_to_model,
    prescription_to_entity,
)

_SORT_COLUMNS = {
    "created_at": PrescriptionModel.created_at,
    "updated_at": PrescriptionModel.updated_at,
}


class SqlAlchemyPrescriptionRepository(PrescriptionRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    def _base_select(self):
        patient = aliased(PatientModel)
        doctor = aliased(DoctorModel)
        consultation = aliased(ConsultationModel)
        stmt = (
            select(PrescriptionModel, patient, doctor, consultation)
            .options(selectinload(PrescriptionModel.items))
            .join(patient, PrescriptionModel.patient_id == patient.id)
            .join(doctor, PrescriptionModel.doctor_id == doctor.id)
            .join(consultation, PrescriptionModel.consultation_id == consultation.id)
        )
        return stmt, patient, doctor, consultation

    def _map_row(self, row) -> Prescription:
        model, patient, doctor, consultation = row
        return prescription_to_entity(model, patient, doctor, consultation)

    async def get_by_id(self, prescription_id: UUID) -> Prescription | None:
        stmt, _, _, _ = self._base_select()
        result = await self._session.execute(
            stmt.where(
                PrescriptionModel.id == prescription_id,
                PrescriptionModel.deleted_at.is_(None),
            )
        )
        row = result.first()
        return self._map_row(row) if row else None

    async def create(self, prescription: Prescription) -> Prescription:
        model = PrescriptionModel(
            id=prescription.id,
            consultation_id=prescription.consultation_id,
            patient_id=prescription.patient_id,
            doctor_id=prescription.doctor_id,
            diagnosis=prescription.diagnosis,
            advice=prescription.advice,
        )
        if prescription.items:
            model.items = [prescription_item_to_model(item) for item in prescription.items]
        self._session.add(model)
        await self._session.flush()
        created = await self.get_by_id(model.id)
        assert created is not None
        return created

    async def update(self, prescription: Prescription) -> Prescription:
        await self._session.execute(
            update(PrescriptionModel)
            .where(PrescriptionModel.id == prescription.id)
            .values(
                diagnosis=prescription.diagnosis,
                advice=prescription.advice,
            )
        )
        await self._session.execute(
            delete(PrescriptionItemModel).where(
                PrescriptionItemModel.prescription_id == prescription.id
            )
        )
        if prescription.items:
            for item in prescription.items:
                self._session.add(prescription_item_to_model(item))
        await self._session.flush()
        updated = await self.get_by_id(prescription.id)
        assert updated is not None
        return updated

    async def soft_delete(self, prescription_id: UUID) -> bool:
        result = await self._session.execute(
            update(PrescriptionModel)
            .where(
                PrescriptionModel.id == prescription_id,
                PrescriptionModel.deleted_at.is_(None),
            )
            .values(deleted_at=func.now())
        )
        return (result.rowcount or 0) > 0

    async def list_prescriptions(self, criteria: PrescriptionListCriteria) -> PrescriptionPage:
        stmt, _, _, _ = self._base_select()
        conditions = [PrescriptionModel.deleted_at.is_(None)]

        if criteria.consultation_id is not None:
            conditions.append(PrescriptionModel.consultation_id == criteria.consultation_id)
        if criteria.patient_id is not None:
            conditions.append(PrescriptionModel.patient_id == criteria.patient_id)
        if criteria.doctor_id is not None:
            conditions.append(PrescriptionModel.doctor_id == criteria.doctor_id)

        sort_column = _SORT_COLUMNS.get(criteria.sort_by.value, PrescriptionModel.created_at)
        order = sort_column.asc() if criteria.sort_dir == SortDirection.ASC else sort_column.desc()

        count_stmt = select(func.count()).select_from(PrescriptionModel).where(and_(*conditions))
        total = (await self._session.execute(count_stmt)).scalar_one()

        offset = (criteria.page - 1) * criteria.page_size
        result = await self._session.execute(
            stmt.where(and_(*conditions)).order_by(order).offset(offset).limit(criteria.page_size)
        )
        items = [self._map_row(row) for row in result.all()]
        return PrescriptionPage(items=items, total=total, page=criteria.page, page_size=criteria.page_size)

    async def search_prescriptions(self, query: str, page: int, page_size: int) -> PrescriptionPage:
        stmt, patient, doctor, consultation = self._base_select()
        pattern = f"%{query}%"
        conditions = and_(
            PrescriptionModel.deleted_at.is_(None),
            or_(
                PrescriptionModel.diagnosis.ilike(pattern),
                PrescriptionModel.advice.ilike(pattern),
                patient.first_name.ilike(pattern),
                patient.last_name.ilike(pattern),
                patient.mrn.ilike(pattern),
                patient.uhid.ilike(pattern),
                doctor.full_name.ilike(pattern),
                doctor.doctor_code.ilike(pattern),
                consultation.visit_number.ilike(pattern),
            ),
        )

        total = (
            await self._session.execute(
                select(func.count())
                .select_from(PrescriptionModel)
                .join(patient, PrescriptionModel.patient_id == patient.id)
                .join(doctor, PrescriptionModel.doctor_id == doctor.id)
                .join(consultation, PrescriptionModel.consultation_id == consultation.id)
                .where(conditions)
            )
        ).scalar_one()

        offset = (page - 1) * page_size
        result = await self._session.execute(
            stmt.where(conditions)
            .order_by(PrescriptionModel.created_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        items = [self._map_row(row) for row in result.all()]
        return PrescriptionPage(items=items, total=total, page=page, page_size=page_size)
