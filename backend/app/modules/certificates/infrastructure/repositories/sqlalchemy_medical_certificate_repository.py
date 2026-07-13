from uuid import UUID

from sqlalchemy import and_, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased

from app.modules.certificates.domain.entities.medical_certificate import MedicalCertificate
from app.modules.certificates.domain.repositories.medical_certificate_repository import (
    MedicalCertificateRepository,
)
from app.modules.certificates.domain.value_objects import (
    CertificateListCriteria,
    CertificatePage,
    SortDirection,
)
from app.modules.certificates.infrastructure.models.medical_certificate_model import (
    MedicalCertificateModel,
)
from app.modules.certificates.infrastructure.repositories.mappers import certificate_to_entity
from app.modules.doctors.infrastructure.models.doctor_model import DoctorModel
from app.modules.patients.infrastructure.models.patient_model import PatientModel

_SORT_COLUMNS = {
    "created_at": MedicalCertificateModel.created_at,
    "updated_at": MedicalCertificateModel.updated_at,
    "issue_date": MedicalCertificateModel.issue_date,
    "certificate_number": MedicalCertificateModel.certificate_number,
}


class SqlAlchemyMedicalCertificateRepository(MedicalCertificateRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    def _base_select(self):
        patient = aliased(PatientModel)
        doctor = aliased(DoctorModel)
        stmt = (
            select(MedicalCertificateModel, patient, doctor)
            .join(patient, MedicalCertificateModel.patient_id == patient.id)
            .join(doctor, MedicalCertificateModel.doctor_id == doctor.id)
        )
        return stmt, patient, doctor

    def _map_row(self, row) -> MedicalCertificate:
        model, patient, doctor = row
        return certificate_to_entity(model, patient, doctor)

    async def get_by_id(self, certificate_id: UUID) -> MedicalCertificate | None:
        stmt, _, _ = self._base_select()
        result = await self._session.execute(
            stmt.where(
                MedicalCertificateModel.id == certificate_id,
                MedicalCertificateModel.deleted_at.is_(None),
            )
        )
        row = result.first()
        return self._map_row(row) if row else None

    async def create(self, certificate: MedicalCertificate) -> MedicalCertificate:
        model = MedicalCertificateModel(
            id=certificate.id,
            certificate_number=certificate.certificate_number,
            patient_id=certificate.patient_id,
            doctor_id=certificate.doctor_id,
            consultation_id=certificate.consultation_id,
            certificate_type=certificate.certificate_type.value,
            issue_date=certificate.issue_date,
            valid_from=certificate.valid_from,
            valid_to=certificate.valid_to,
            diagnosis=certificate.diagnosis,
            remarks=certificate.remarks,
            fitness_status=certificate.fitness_status,
            rest_days=certificate.rest_days,
            issued_by=certificate.issued_by,
        )
        self._session.add(model)
        await self._session.flush()
        created = await self.get_by_id(model.id)
        assert created is not None
        return created

    async def update(self, certificate: MedicalCertificate) -> MedicalCertificate:
        await self._session.execute(
            update(MedicalCertificateModel)
            .where(MedicalCertificateModel.id == certificate.id)
            .values(
                doctor_id=certificate.doctor_id,
                consultation_id=certificate.consultation_id,
                certificate_type=certificate.certificate_type.value,
                issue_date=certificate.issue_date,
                valid_from=certificate.valid_from,
                valid_to=certificate.valid_to,
                diagnosis=certificate.diagnosis,
                remarks=certificate.remarks,
                fitness_status=certificate.fitness_status,
                rest_days=certificate.rest_days,
                updated_at=certificate.updated_at,
            )
        )
        await self._session.flush()
        updated = await self.get_by_id(certificate.id)
        assert updated is not None
        return updated

    async def soft_delete(self, certificate_id: UUID) -> bool:
        result = await self._session.execute(
            update(MedicalCertificateModel)
            .where(
                MedicalCertificateModel.id == certificate_id,
                MedicalCertificateModel.deleted_at.is_(None),
            )
            .values(deleted_at=func.now())
        )
        return (result.rowcount or 0) > 0

    async def list_certificates(self, criteria: CertificateListCriteria) -> CertificatePage:
        stmt, _, _ = self._base_select()
        conditions = [MedicalCertificateModel.deleted_at.is_(None)]

        if criteria.patient_id is not None:
            conditions.append(MedicalCertificateModel.patient_id == criteria.patient_id)
        if criteria.doctor_id is not None:
            conditions.append(MedicalCertificateModel.doctor_id == criteria.doctor_id)
        if criteria.certificate_type is not None:
            conditions.append(
                MedicalCertificateModel.certificate_type == criteria.certificate_type.value
            )

        sort_column = _SORT_COLUMNS.get(
            criteria.sort_by.value, MedicalCertificateModel.created_at
        )
        order = sort_column.asc() if criteria.sort_dir == SortDirection.ASC else sort_column.desc()

        count_stmt = (
            select(func.count()).select_from(MedicalCertificateModel).where(and_(*conditions))
        )
        total = (await self._session.execute(count_stmt)).scalar_one()

        offset = (criteria.page - 1) * criteria.page_size
        result = await self._session.execute(
            stmt.where(and_(*conditions)).order_by(order).offset(offset).limit(criteria.page_size)
        )
        items = [self._map_row(row) for row in result.all()]
        return CertificatePage(
            items=items, total=total, page=criteria.page, page_size=criteria.page_size
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
