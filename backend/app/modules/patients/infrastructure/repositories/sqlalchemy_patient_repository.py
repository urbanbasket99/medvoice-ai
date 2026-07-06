from uuid import UUID

from sqlalchemy import and_, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.patients.domain.entities.patient import Patient
from app.modules.patients.domain.repositories.patient_repository import PatientRepository
from app.modules.patients.domain.value_objects import (
    PatientListCriteria,
    PatientPage,
    SortDirection,
)
from app.modules.patients.infrastructure.models.patient_model import PatientModel
from app.modules.patients.infrastructure.repositories.mappers import patient_to_entity

_SORT_COLUMNS = {
    "created_at": PatientModel.created_at,
    "first_name": PatientModel.first_name,
    "last_name": PatientModel.last_name,
    "uhid": PatientModel.uhid,
    "mrn": PatientModel.mrn,
    "date_of_birth": PatientModel.date_of_birth,
    "registration_date": PatientModel.registration_date,
}


class SqlAlchemyPatientRepository(PatientRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, patient_id: UUID) -> Patient | None:
        result = await self._session.execute(
            select(PatientModel).where(
                PatientModel.id == patient_id, PatientModel.deleted_at.is_(None)
            )
        )
        model = result.scalar_one_or_none()
        return patient_to_entity(model) if model else None

    async def get_by_uhid(self, uhid: str) -> Patient | None:
        result = await self._session.execute(
            select(PatientModel).where(PatientModel.uhid == uhid, PatientModel.deleted_at.is_(None))
        )
        model = result.scalar_one_or_none()
        return patient_to_entity(model) if model else None

    async def exists_by_mobile(self, mobile: str, exclude_id: UUID | None = None) -> bool:
        stmt = select(PatientModel.id).where(
            PatientModel.mobile == mobile, PatientModel.deleted_at.is_(None)
        )
        if exclude_id is not None:
            stmt = stmt.where(PatientModel.id != exclude_id)
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none() is not None

    async def exists_by_email(self, email: str, exclude_id: UUID | None = None) -> bool:
        stmt = select(PatientModel.id).where(
            PatientModel.email == email.lower(), PatientModel.deleted_at.is_(None)
        )
        if exclude_id is not None:
            stmt = stmt.where(PatientModel.id != exclude_id)
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none() is not None

    async def create(self, patient: Patient) -> Patient:
        model = PatientModel(
            id=patient.id,
            mrn=patient.mrn,
            uhid=patient.uhid,
            first_name=patient.first_name,
            middle_name=patient.middle_name,
            last_name=patient.last_name,
            date_of_birth=patient.date_of_birth,
            gender=patient.gender.value,
            blood_group=patient.blood_group.value if patient.blood_group else None,
            marital_status=patient.marital_status.value if patient.marital_status else None,
            occupation=patient.occupation,
            mobile=patient.mobile,
            alternate_mobile=patient.alternate_mobile,
            email=patient.email,
            address_line1=patient.address_line1,
            address_line2=patient.address_line2,
            city=patient.city,
            state=patient.state,
            country=patient.country,
            postal_code=patient.postal_code,
            emergency_name=patient.emergency_name,
            emergency_relation=patient.emergency_relation,
            emergency_mobile=patient.emergency_mobile,
            insurance_provider=patient.insurance_provider,
            insurance_number=patient.insurance_number,
            allergies=patient.allergies,
            chronic_conditions=patient.chronic_conditions,
            notes=patient.notes,
            registration_date=patient.registration_date,
            status=patient.status.value,
            created_by=patient.created_by,
            updated_by=patient.updated_by,
        )
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return patient_to_entity(model)

    async def update(self, patient: Patient) -> Patient:
        await self._session.execute(
            update(PatientModel)
            .where(PatientModel.id == patient.id)
            .values(
                first_name=patient.first_name,
                middle_name=patient.middle_name,
                last_name=patient.last_name,
                date_of_birth=patient.date_of_birth,
                gender=patient.gender.value,
                blood_group=patient.blood_group.value if patient.blood_group else None,
                marital_status=patient.marital_status.value if patient.marital_status else None,
                occupation=patient.occupation,
                mobile=patient.mobile,
                alternate_mobile=patient.alternate_mobile,
                email=patient.email,
                address_line1=patient.address_line1,
                address_line2=patient.address_line2,
                city=patient.city,
                state=patient.state,
                country=patient.country,
                postal_code=patient.postal_code,
                emergency_name=patient.emergency_name,
                emergency_relation=patient.emergency_relation,
                emergency_mobile=patient.emergency_mobile,
                insurance_provider=patient.insurance_provider,
                insurance_number=patient.insurance_number,
                allergies=patient.allergies,
                chronic_conditions=patient.chronic_conditions,
                notes=patient.notes,
                registration_date=patient.registration_date,
                status=patient.status.value,
                updated_by=patient.updated_by,
            )
        )
        result = await self._session.execute(select(PatientModel).where(PatientModel.id == patient.id))
        model = result.scalar_one()
        return patient_to_entity(model)

    async def soft_delete(self, patient_id: UUID) -> bool:
        result = await self._session.execute(
            update(PatientModel)
            .where(PatientModel.id == patient_id, PatientModel.deleted_at.is_(None))
            .values(deleted_at=func.now(), status="inactive")
        )
        return (result.rowcount or 0) > 0

    async def list_patients(self, criteria: PatientListCriteria) -> PatientPage:
        conditions = [PatientModel.deleted_at.is_(None)]
        if criteria.status is not None:
            conditions.append(PatientModel.status == criteria.status.value)
        if criteria.gender is not None:
            conditions.append(PatientModel.gender == criteria.gender.value)
        if criteria.blood_group is not None:
            conditions.append(PatientModel.blood_group == criteria.blood_group.value)
        if criteria.city:
            conditions.append(PatientModel.city.ilike(f"%{criteria.city}%"))

        sort_column = _SORT_COLUMNS.get(criteria.sort_by.value, PatientModel.created_at)
        order = sort_column.asc() if criteria.sort_dir == SortDirection.ASC else sort_column.desc()

        total = (
            await self._session.execute(
                select(func.count()).select_from(PatientModel).where(and_(*conditions))
            )
        ).scalar_one()

        offset = (criteria.page - 1) * criteria.page_size
        result = await self._session.execute(
            select(PatientModel)
            .where(and_(*conditions))
            .order_by(order)
            .offset(offset)
            .limit(criteria.page_size)
        )
        items = [patient_to_entity(model) for model in result.scalars().all()]
        return PatientPage(items=items, total=total, page=criteria.page, page_size=criteria.page_size)

    async def search_patients(self, query: str, page: int, page_size: int) -> PatientPage:
        pattern = f"%{query}%"
        conditions = and_(
            PatientModel.deleted_at.is_(None),
            or_(
                PatientModel.uhid.ilike(pattern),
                PatientModel.mrn.ilike(pattern),
                PatientModel.first_name.ilike(pattern),
                PatientModel.last_name.ilike(pattern),
                PatientModel.mobile.ilike(pattern),
                PatientModel.email.ilike(pattern),
            ),
        )

        total = (
            await self._session.execute(select(func.count()).select_from(PatientModel).where(conditions))
        ).scalar_one()

        offset = (page - 1) * page_size
        result = await self._session.execute(
            select(PatientModel)
            .where(conditions)
            .order_by(PatientModel.created_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        items = [patient_to_entity(model) for model in result.scalars().all()]
        return PatientPage(items=items, total=total, page=page, page_size=page_size)
