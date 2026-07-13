from uuid import UUID

from sqlalchemy import and_, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased

from app.infrastructure.models.user import UserModel
from app.modules.consultations.infrastructure.models.consultation_model import ConsultationModel
from app.modules.doctors.infrastructure.models.doctor_model import DoctorModel
from app.modules.ipd.domain.entities.admission import Admission
from app.modules.ipd.domain.repositories.admission_repository import AdmissionRepository
from app.modules.ipd.domain.value_objects import AdmissionListCriteria, AdmissionPage, SortDirection
from app.modules.ipd.infrastructure.models.ipd_model import IpdAdmissionModel, IpdBedModel, IpdWardModel
from app.modules.ipd.infrastructure.repositories.mappers import admission_to_entity
from app.modules.patients.infrastructure.models.patient_model import PatientModel

_SORT_COLUMNS = {
    "created_at": IpdAdmissionModel.created_at,
    "updated_at": IpdAdmissionModel.updated_at,
    "admission_date": IpdAdmissionModel.admission_date,
    "admission_number": IpdAdmissionModel.admission_number,
}


class SqlAlchemyAdmissionRepository(AdmissionRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    def _base_select(self):
        patient = aliased(PatientModel)
        doctor = aliased(DoctorModel)
        consultation = aliased(ConsultationModel)
        bed = aliased(IpdBedModel)
        ward = aliased(IpdWardModel)
        discharged_by_user = aliased(UserModel)
        stmt = (
            select(IpdAdmissionModel, patient, doctor, consultation, bed, ward, discharged_by_user)
            .join(patient, IpdAdmissionModel.patient_id == patient.id)
            .join(doctor, IpdAdmissionModel.admitting_doctor_id == doctor.id)
            .outerjoin(consultation, IpdAdmissionModel.consultation_id == consultation.id)
            .outerjoin(bed, IpdAdmissionModel.bed_id == bed.id)
            .outerjoin(ward, bed.ward_id == ward.id)
            .outerjoin(discharged_by_user, IpdAdmissionModel.discharged_by == discharged_by_user.id)
        )
        return stmt, patient, doctor, consultation, bed, ward, discharged_by_user

    def _map_row(self, row) -> Admission:
        model, patient, doctor, consultation, bed, ward, discharged_by_user = row
        return admission_to_entity(model, patient, doctor, consultation, bed, ward, discharged_by_user)

    async def get_by_id(self, admission_id: UUID) -> Admission | None:
        stmt, _, _, _, _, _, _ = self._base_select()
        result = await self._session.execute(
            stmt.where(
                IpdAdmissionModel.id == admission_id,
                IpdAdmissionModel.deleted_at.is_(None),
            )
        )
        row = result.first()
        return self._map_row(row) if row else None

    async def create(self, admission: Admission) -> Admission:
        model = IpdAdmissionModel(
            id=admission.id,
            admission_number=admission.admission_number,
            patient_id=admission.patient_id,
            consultation_id=admission.consultation_id,
            admitting_doctor_id=admission.admitting_doctor_id,
            bed_id=admission.bed_id,
            admission_date=admission.admission_date,
            expected_discharge_date=admission.expected_discharge_date,
            admission_type=admission.admission_type.value,
            status=admission.status.value,
            chief_complaint=admission.chief_complaint,
            diagnosis=admission.diagnosis,
            notes=admission.notes,
            discharged_at=admission.discharged_at,
            discharge_summary=admission.discharge_summary,
            discharged_by=admission.discharged_by,
        )
        self._session.add(model)
        await self._session.flush()
        created = await self.get_by_id(model.id)
        assert created is not None
        return created

    async def update(self, admission: Admission) -> Admission:
        await self._session.execute(
            update(IpdAdmissionModel)
            .where(IpdAdmissionModel.id == admission.id)
            .values(
                consultation_id=admission.consultation_id,
                admitting_doctor_id=admission.admitting_doctor_id,
                bed_id=admission.bed_id,
                admission_date=admission.admission_date,
                expected_discharge_date=admission.expected_discharge_date,
                admission_type=admission.admission_type.value,
                status=admission.status.value,
                chief_complaint=admission.chief_complaint,
                diagnosis=admission.diagnosis,
                notes=admission.notes,
                discharged_at=admission.discharged_at,
                discharge_summary=admission.discharge_summary,
                discharged_by=admission.discharged_by,
                updated_at=admission.updated_at,
            )
        )
        await self._session.flush()
        updated = await self.get_by_id(admission.id)
        assert updated is not None
        return updated

    async def list_admissions(self, criteria: AdmissionListCriteria) -> AdmissionPage:
        stmt, _, _, _, _, _, _ = self._base_select()
        conditions = [IpdAdmissionModel.deleted_at.is_(None)]
        if criteria.patient_id is not None:
            conditions.append(IpdAdmissionModel.patient_id == criteria.patient_id)
        if criteria.admitting_doctor_id is not None:
            conditions.append(IpdAdmissionModel.admitting_doctor_id == criteria.admitting_doctor_id)
        if criteria.consultation_id is not None:
            conditions.append(IpdAdmissionModel.consultation_id == criteria.consultation_id)
        if criteria.bed_id is not None:
            conditions.append(IpdAdmissionModel.bed_id == criteria.bed_id)
        if criteria.status is not None:
            conditions.append(IpdAdmissionModel.status == criteria.status.value)
        if criteria.admission_type is not None:
            conditions.append(IpdAdmissionModel.admission_type == criteria.admission_type.value)

        sort_column = _SORT_COLUMNS.get(criteria.sort_by.value, IpdAdmissionModel.created_at)
        order = sort_column.asc() if criteria.sort_dir == SortDirection.ASC else sort_column.desc()

        total = (
            await self._session.execute(
                select(func.count()).select_from(IpdAdmissionModel).where(and_(*conditions))
            )
        ).scalar_one()

        offset = (criteria.page - 1) * criteria.page_size
        result = await self._session.execute(
            stmt.where(and_(*conditions)).order_by(order).offset(offset).limit(criteria.page_size)
        )
        items = [self._map_row(row) for row in result.all()]
        return AdmissionPage(items=items, total=total, page=criteria.page, page_size=criteria.page_size)

    async def patient_exists(self, patient_id: UUID) -> bool:
        result = await self._session.execute(
            select(PatientModel.id).where(
                PatientModel.id == patient_id,
                PatientModel.deleted_at.is_(None),
            )
        )
        return result.scalar_one_or_none() is not None

    async def doctor_exists(self, doctor_id: UUID) -> bool:
        result = await self._session.execute(
            select(DoctorModel.id).where(
                DoctorModel.id == doctor_id,
                DoctorModel.deleted_at.is_(None),
            )
        )
        return result.scalar_one_or_none() is not None

    async def consultation_matches_patient(
        self, consultation_id: UUID, patient_id: UUID
    ) -> bool:
        result = await self._session.execute(
            select(ConsultationModel.id).where(
                ConsultationModel.id == consultation_id,
                ConsultationModel.patient_id == patient_id,
                ConsultationModel.deleted_at.is_(None),
            )
        )
        return result.scalar_one_or_none() is not None

    async def has_active_admission(self, patient_id: UUID) -> bool:
        result = await self._session.execute(
            select(IpdAdmissionModel.id).where(
                IpdAdmissionModel.patient_id == patient_id,
                IpdAdmissionModel.status == "admitted",
                IpdAdmissionModel.deleted_at.is_(None),
            )
        )
        return result.scalar_one_or_none() is not None
