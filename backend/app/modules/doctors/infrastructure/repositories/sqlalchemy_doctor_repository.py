from uuid import UUID

from sqlalchemy import and_, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.doctors.domain.entities.doctor import Doctor
from app.modules.doctors.domain.repositories.doctor_repository import DoctorRepository
from app.modules.doctors.domain.value_objects import (
    DoctorListCriteria,
    DoctorPage,
    SortDirection,
)
from app.modules.doctors.infrastructure.models.doctor_model import DoctorModel
from app.modules.doctors.infrastructure.repositories.mappers import doctor_to_entity

_SORT_COLUMNS = {
    "created_at": DoctorModel.created_at,
    "full_name": DoctorModel.full_name,
    "doctor_code": DoctorModel.doctor_code,
    "department": DoctorModel.department,
    "experience_years": DoctorModel.experience_years,
    "joining_date": DoctorModel.joining_date,
}


class SqlAlchemyDoctorRepository(DoctorRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, doctor_id: UUID) -> Doctor | None:
        result = await self._session.execute(
            select(DoctorModel).where(DoctorModel.id == doctor_id, DoctorModel.deleted_at.is_(None))
        )
        model = result.scalar_one_or_none()
        return doctor_to_entity(model) if model else None

    async def get_by_code(self, doctor_code: str) -> Doctor | None:
        result = await self._session.execute(
            select(DoctorModel).where(
                DoctorModel.doctor_code == doctor_code, DoctorModel.deleted_at.is_(None)
            )
        )
        model = result.scalar_one_or_none()
        return doctor_to_entity(model) if model else None

    async def exists_by_mobile(self, mobile: str, exclude_id: UUID | None = None) -> bool:
        stmt = select(DoctorModel.id).where(
            DoctorModel.mobile == mobile, DoctorModel.deleted_at.is_(None)
        )
        if exclude_id is not None:
            stmt = stmt.where(DoctorModel.id != exclude_id)
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none() is not None

    async def exists_by_email(self, email: str, exclude_id: UUID | None = None) -> bool:
        stmt = select(DoctorModel.id).where(
            DoctorModel.email == email.lower(), DoctorModel.deleted_at.is_(None)
        )
        if exclude_id is not None:
            stmt = stmt.where(DoctorModel.id != exclude_id)
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none() is not None

    async def exists_by_registration_number(
        self, registration_number: str, exclude_id: UUID | None = None
    ) -> bool:
        stmt = select(DoctorModel.id).where(
            DoctorModel.registration_number == registration_number, DoctorModel.deleted_at.is_(None)
        )
        if exclude_id is not None:
            stmt = stmt.where(DoctorModel.id != exclude_id)
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none() is not None

    async def create(self, doctor: Doctor) -> Doctor:
        model = DoctorModel(
            id=doctor.id,
            doctor_code=doctor.doctor_code,
            full_name=doctor.full_name,
            gender=doctor.gender.value,
            date_of_birth=doctor.date_of_birth,
            department=doctor.department.value,
            specialization=doctor.specialization,
            qualification=doctor.qualification,
            registration_number=doctor.registration_number,
            experience_years=doctor.experience_years,
            mobile=doctor.mobile,
            email=doctor.email,
            address=doctor.address,
            languages_spoken=doctor.languages_spoken or None,
            consultation_fee=doctor.consultation_fee,
            working_hours=doctor.working_hours,
            photo_url=doctor.photo_url,
            joining_date=doctor.joining_date,
            status=doctor.status.value,
        )
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return doctor_to_entity(model)

    async def update(self, doctor: Doctor) -> Doctor:
        await self._session.execute(
            update(DoctorModel)
            .where(DoctorModel.id == doctor.id)
            .values(
                full_name=doctor.full_name,
                gender=doctor.gender.value,
                date_of_birth=doctor.date_of_birth,
                department=doctor.department.value,
                specialization=doctor.specialization,
                qualification=doctor.qualification,
                registration_number=doctor.registration_number,
                experience_years=doctor.experience_years,
                mobile=doctor.mobile,
                email=doctor.email,
                address=doctor.address,
                languages_spoken=doctor.languages_spoken or None,
                consultation_fee=doctor.consultation_fee,
                working_hours=doctor.working_hours,
                photo_url=doctor.photo_url,
                joining_date=doctor.joining_date,
                status=doctor.status.value,
            )
        )
        result = await self._session.execute(select(DoctorModel).where(DoctorModel.id == doctor.id))
        model = result.scalar_one()
        return doctor_to_entity(model)

    async def soft_delete(self, doctor_id: UUID) -> bool:
        result = await self._session.execute(
            update(DoctorModel)
            .where(DoctorModel.id == doctor_id, DoctorModel.deleted_at.is_(None))
            .values(deleted_at=func.now(), status="inactive")
        )
        return (result.rowcount or 0) > 0

    async def list_doctors(self, criteria: DoctorListCriteria) -> DoctorPage:
        conditions = [DoctorModel.deleted_at.is_(None)]
        if criteria.status is not None:
            conditions.append(DoctorModel.status == criteria.status.value)
        if criteria.department is not None:
            conditions.append(DoctorModel.department == criteria.department.value)
        if criteria.gender is not None:
            conditions.append(DoctorModel.gender == criteria.gender.value)
        if criteria.specialization:
            conditions.append(DoctorModel.specialization.ilike(f"%{criteria.specialization}%"))

        sort_column = _SORT_COLUMNS.get(criteria.sort_by.value, DoctorModel.created_at)
        order = sort_column.asc() if criteria.sort_dir == SortDirection.ASC else sort_column.desc()

        total = (
            await self._session.execute(
                select(func.count()).select_from(DoctorModel).where(and_(*conditions))
            )
        ).scalar_one()

        offset = (criteria.page - 1) * criteria.page_size
        result = await self._session.execute(
            select(DoctorModel)
            .where(and_(*conditions))
            .order_by(order)
            .offset(offset)
            .limit(criteria.page_size)
        )
        items = [doctor_to_entity(model) for model in result.scalars().all()]
        return DoctorPage(items=items, total=total, page=criteria.page, page_size=criteria.page_size)

    async def search_doctors(self, query: str, page: int, page_size: int) -> DoctorPage:
        pattern = f"%{query}%"
        conditions = and_(
            DoctorModel.deleted_at.is_(None),
            or_(
                DoctorModel.doctor_code.ilike(pattern),
                DoctorModel.full_name.ilike(pattern),
                DoctorModel.registration_number.ilike(pattern),
                DoctorModel.specialization.ilike(pattern),
                DoctorModel.mobile.ilike(pattern),
                DoctorModel.email.ilike(pattern),
            ),
        )

        total = (
            await self._session.execute(select(func.count()).select_from(DoctorModel).where(conditions))
        ).scalar_one()

        offset = (page - 1) * page_size
        result = await self._session.execute(
            select(DoctorModel)
            .where(conditions)
            .order_by(DoctorModel.created_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        items = [doctor_to_entity(model) for model in result.scalars().all()]
        return DoctorPage(items=items, total=total, page=page, page_size=page_size)
