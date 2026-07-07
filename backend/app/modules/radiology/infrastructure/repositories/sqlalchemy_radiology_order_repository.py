from datetime import UTC, datetime
from uuid import UUID, uuid4

from sqlalchemy import and_, delete, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased, selectinload

from app.modules.consultations.infrastructure.models.consultation_model import ConsultationModel
from app.modules.doctors.infrastructure.models.doctor_model import DoctorModel
from app.modules.patients.infrastructure.models.patient_model import PatientModel
from app.modules.radiology.domain.entities.radiology_order import RadiologyOrder
from app.modules.radiology.domain.repositories.radiology_order_repository import RadiologyOrderRepository
from app.modules.radiology.domain.value_objects import (
    RadiologyOrderListCriteria,
    RadiologyOrderPage,
    RadiologyStatus,
    SortDirection,
)
from app.modules.radiology.infrastructure.models.radiology_order_model import (
    RadiologyOrderItemModel,
    RadiologyOrderModel,
    RadiologyOrderStatusEventModel,
)
from app.modules.radiology.infrastructure.repositories.mappers import (
    radiology_order_item_to_model,
    radiology_order_status_event_to_model,
    radiology_order_to_entity,
)

_SORT_COLUMNS = {
    "created_at": RadiologyOrderModel.created_at,
    "updated_at": RadiologyOrderModel.updated_at,
    "order_number": RadiologyOrderModel.order_number,
}


class SqlAlchemyRadiologyOrderRepository(RadiologyOrderRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    def _base_select(self):
        patient = aliased(PatientModel)
        doctor = aliased(DoctorModel)
        consultation = aliased(ConsultationModel)
        stmt = (
            select(RadiologyOrderModel, patient, doctor, consultation)
            .options(
                selectinload(RadiologyOrderModel.items),
                selectinload(RadiologyOrderModel.status_history),
            )
            .join(patient, RadiologyOrderModel.patient_id == patient.id)
            .join(doctor, RadiologyOrderModel.doctor_id == doctor.id)
            .join(consultation, RadiologyOrderModel.consultation_id == consultation.id)
        )
        return stmt, patient, doctor, consultation

    def _map_row(self, row) -> RadiologyOrder:
        model, patient, doctor, consultation = row
        return radiology_order_to_entity(model, patient, doctor, consultation)

    async def get_by_id(self, radiology_order_id: UUID) -> RadiologyOrder | None:
        stmt, _, _, _ = self._base_select()
        result = await self._session.execute(
            stmt.where(
                RadiologyOrderModel.id == radiology_order_id,
                RadiologyOrderModel.deleted_at.is_(None),
            )
        )
        row = result.first()
        return self._map_row(row) if row else None

    async def create(self, radiology_order: RadiologyOrder) -> RadiologyOrder:
        model = RadiologyOrderModel(
            id=radiology_order.id,
            consultation_id=radiology_order.consultation_id,
            patient_id=radiology_order.patient_id,
            doctor_id=radiology_order.doctor_id,
            order_number=radiology_order.order_number,
            priority=radiology_order.priority.value,
            clinical_notes=radiology_order.clinical_notes,
            status=radiology_order.status.value,
        )
        if radiology_order.items:
            model.items = [radiology_order_item_to_model(item) for item in radiology_order.items]
        if radiology_order.status_history:
            model.status_history = [
                radiology_order_status_event_to_model(event)
                for event in radiology_order.status_history
            ]
        self._session.add(model)
        await self._session.flush()
        created = await self.get_by_id(model.id)
        assert created is not None
        return created

    async def update(self, radiology_order: RadiologyOrder) -> RadiologyOrder:
        await self._session.execute(
            update(RadiologyOrderModel)
            .where(RadiologyOrderModel.id == radiology_order.id)
            .values(
                priority=radiology_order.priority.value,
                clinical_notes=radiology_order.clinical_notes,
            )
        )
        await self._session.execute(
            delete(RadiologyOrderItemModel).where(
                RadiologyOrderItemModel.radiology_order_id == radiology_order.id
            )
        )
        if radiology_order.items:
            for item in radiology_order.items:
                self._session.add(radiology_order_item_to_model(item))
        await self._session.flush()
        updated = await self.get_by_id(radiology_order.id)
        assert updated is not None
        return updated

    async def update_status(
        self,
        radiology_order_id: UUID,
        status: RadiologyStatus,
        notes: str | None = None,
    ) -> RadiologyOrder:
        now = datetime.now(UTC)
        await self._session.execute(
            update(RadiologyOrderModel)
            .where(RadiologyOrderModel.id == radiology_order_id)
            .values(status=status.value, updated_at=now)
        )
        self._session.add(
            RadiologyOrderStatusEventModel(
                id=uuid4(),
                radiology_order_id=radiology_order_id,
                status=status.value,
                notes=notes,
                changed_at=now,
            )
        )
        await self._session.flush()
        updated = await self.get_by_id(radiology_order_id)
        assert updated is not None
        return updated

    async def soft_delete(self, radiology_order_id: UUID) -> bool:
        result = await self._session.execute(
            update(RadiologyOrderModel)
            .where(
                RadiologyOrderModel.id == radiology_order_id,
                RadiologyOrderModel.deleted_at.is_(None),
            )
            .values(deleted_at=func.now())
        )
        return (result.rowcount or 0) > 0

    async def list_radiology_orders(self, criteria: RadiologyOrderListCriteria) -> RadiologyOrderPage:
        stmt, _, _, _ = self._base_select()
        conditions = [RadiologyOrderModel.deleted_at.is_(None)]

        if criteria.consultation_id is not None:
            conditions.append(RadiologyOrderModel.consultation_id == criteria.consultation_id)
        if criteria.patient_id is not None:
            conditions.append(RadiologyOrderModel.patient_id == criteria.patient_id)
        if criteria.doctor_id is not None:
            conditions.append(RadiologyOrderModel.doctor_id == criteria.doctor_id)
        if criteria.status is not None:
            conditions.append(RadiologyOrderModel.status == criteria.status.value)

        sort_column = _SORT_COLUMNS.get(criteria.sort_by.value, RadiologyOrderModel.created_at)
        order = sort_column.asc() if criteria.sort_dir == SortDirection.ASC else sort_column.desc()

        count_stmt = select(func.count()).select_from(RadiologyOrderModel).where(and_(*conditions))
        total = (await self._session.execute(count_stmt)).scalar_one()

        offset = (criteria.page - 1) * criteria.page_size
        result = await self._session.execute(
            stmt.where(and_(*conditions)).order_by(order).offset(offset).limit(criteria.page_size)
        )
        items = [self._map_row(row) for row in result.all()]
        return RadiologyOrderPage(
            items=items, total=total, page=criteria.page, page_size=criteria.page_size
        )

    async def search_radiology_orders(self, query: str, page: int, page_size: int) -> RadiologyOrderPage:
        stmt, patient, doctor, consultation = self._base_select()
        pattern = f"%{query}%"
        conditions = and_(
            RadiologyOrderModel.deleted_at.is_(None),
            or_(
                RadiologyOrderModel.order_number.ilike(pattern),
                RadiologyOrderModel.clinical_notes.ilike(pattern),
                RadiologyOrderModel.status.ilike(pattern),
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
                .select_from(RadiologyOrderModel)
                .join(patient, RadiologyOrderModel.patient_id == patient.id)
                .join(doctor, RadiologyOrderModel.doctor_id == doctor.id)
                .join(consultation, RadiologyOrderModel.consultation_id == consultation.id)
                .where(conditions)
            )
        ).scalar_one()

        offset = (page - 1) * page_size
        result = await self._session.execute(
            stmt.where(conditions)
            .order_by(RadiologyOrderModel.created_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        items = [self._map_row(row) for row in result.all()]
        return RadiologyOrderPage(items=items, total=total, page=page, page_size=page_size)
