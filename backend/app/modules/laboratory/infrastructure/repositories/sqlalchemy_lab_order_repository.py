from datetime import UTC, datetime
from uuid import UUID, uuid4

from sqlalchemy import and_, delete, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased, selectinload

from app.modules.consultations.infrastructure.models.consultation_model import ConsultationModel
from app.modules.doctors.infrastructure.models.doctor_model import DoctorModel
from app.modules.laboratory.domain.entities.lab_order import LabOrder
from app.modules.laboratory.domain.repositories.lab_order_repository import LabOrderRepository
from app.modules.laboratory.domain.value_objects import LabOrderListCriteria, LabOrderPage, LabStatus, SortDirection
from app.modules.laboratory.infrastructure.models.lab_order_model import (
    LabOrderItemModel,
    LabOrderModel,
    LabOrderStatusEventModel,
)
from app.modules.laboratory.infrastructure.repositories.mappers import (
    lab_order_item_to_model,
    lab_order_status_event_to_model,
    lab_order_to_entity,
)
from app.modules.patients.infrastructure.models.patient_model import PatientModel

_SORT_COLUMNS = {
    "created_at": LabOrderModel.created_at,
    "updated_at": LabOrderModel.updated_at,
    "order_number": LabOrderModel.order_number,
}


class SqlAlchemyLabOrderRepository(LabOrderRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    def _base_select(self):
        patient = aliased(PatientModel)
        doctor = aliased(DoctorModel)
        consultation = aliased(ConsultationModel)
        stmt = (
            select(LabOrderModel, patient, doctor, consultation)
            .options(
                selectinload(LabOrderModel.items),
                selectinload(LabOrderModel.status_history),
            )
            .join(patient, LabOrderModel.patient_id == patient.id)
            .join(doctor, LabOrderModel.doctor_id == doctor.id)
            .join(consultation, LabOrderModel.consultation_id == consultation.id)
        )
        return stmt, patient, doctor, consultation

    def _map_row(self, row) -> LabOrder:
        model, patient, doctor, consultation = row
        return lab_order_to_entity(model, patient, doctor, consultation)

    async def get_by_id(self, lab_order_id: UUID) -> LabOrder | None:
        stmt, _, _, _ = self._base_select()
        result = await self._session.execute(
            stmt.where(
                LabOrderModel.id == lab_order_id,
                LabOrderModel.deleted_at.is_(None),
            )
        )
        row = result.first()
        return self._map_row(row) if row else None

    async def create(self, lab_order: LabOrder) -> LabOrder:
        model = LabOrderModel(
            id=lab_order.id,
            consultation_id=lab_order.consultation_id,
            patient_id=lab_order.patient_id,
            doctor_id=lab_order.doctor_id,
            order_number=lab_order.order_number,
            priority=lab_order.priority.value,
            clinical_notes=lab_order.clinical_notes,
            status=lab_order.status.value,
        )
        if lab_order.items:
            model.items = [lab_order_item_to_model(item) for item in lab_order.items]
        if lab_order.status_history:
            model.status_history = [
                lab_order_status_event_to_model(event) for event in lab_order.status_history
            ]
        self._session.add(model)
        await self._session.flush()
        created = await self.get_by_id(model.id)
        assert created is not None
        return created

    async def update(self, lab_order: LabOrder) -> LabOrder:
        await self._session.execute(
            update(LabOrderModel)
            .where(LabOrderModel.id == lab_order.id)
            .values(
                priority=lab_order.priority.value,
                clinical_notes=lab_order.clinical_notes,
                is_partial_report=lab_order.is_partial_report,
                updated_at=lab_order.updated_at,
            )
        )
        await self._session.execute(
            delete(LabOrderItemModel).where(LabOrderItemModel.lab_order_id == lab_order.id)
        )
        if lab_order.items:
            for item in lab_order.items:
                self._session.add(lab_order_item_to_model(item))
        await self._session.flush()
        updated = await self.get_by_id(lab_order.id)
        assert updated is not None
        return updated

    async def update_status(
        self,
        lab_order_id: UUID,
        status: LabStatus,
        notes: str | None = None,
    ) -> LabOrder:
        now = datetime.now(UTC)
        await self._session.execute(
            update(LabOrderModel)
            .where(LabOrderModel.id == lab_order_id)
            .values(status=status.value, updated_at=now)
        )
        self._session.add(
            LabOrderStatusEventModel(
                id=uuid4(),
                lab_order_id=lab_order_id,
                status=status.value,
                notes=notes,
                changed_at=now,
            )
        )
        await self._session.flush()
        updated = await self.get_by_id(lab_order_id)
        assert updated is not None
        return updated

    async def soft_delete(self, lab_order_id: UUID) -> bool:
        result = await self._session.execute(
            update(LabOrderModel)
            .where(
                LabOrderModel.id == lab_order_id,
                LabOrderModel.deleted_at.is_(None),
            )
            .values(deleted_at=func.now())
        )
        return (result.rowcount or 0) > 0

    async def list_lab_orders(self, criteria: LabOrderListCriteria) -> LabOrderPage:
        stmt, _, _, _ = self._base_select()
        conditions = [LabOrderModel.deleted_at.is_(None)]

        if criteria.consultation_id is not None:
            conditions.append(LabOrderModel.consultation_id == criteria.consultation_id)
        if criteria.patient_id is not None:
            conditions.append(LabOrderModel.patient_id == criteria.patient_id)
        if criteria.doctor_id is not None:
            conditions.append(LabOrderModel.doctor_id == criteria.doctor_id)
        if criteria.status is not None:
            conditions.append(LabOrderModel.status == criteria.status.value)

        sort_column = _SORT_COLUMNS.get(criteria.sort_by.value, LabOrderModel.created_at)
        order = sort_column.asc() if criteria.sort_dir == SortDirection.ASC else sort_column.desc()

        count_stmt = select(func.count()).select_from(LabOrderModel).where(and_(*conditions))
        total = (await self._session.execute(count_stmt)).scalar_one()

        offset = (criteria.page - 1) * criteria.page_size
        result = await self._session.execute(
            stmt.where(and_(*conditions)).order_by(order).offset(offset).limit(criteria.page_size)
        )
        items = [self._map_row(row) for row in result.all()]
        return LabOrderPage(items=items, total=total, page=criteria.page, page_size=criteria.page_size)

    async def search_lab_orders(self, query: str, page: int, page_size: int) -> LabOrderPage:
        stmt, patient, doctor, consultation = self._base_select()
        pattern = f"%{query}%"
        conditions = and_(
            LabOrderModel.deleted_at.is_(None),
            or_(
                LabOrderModel.order_number.ilike(pattern),
                LabOrderModel.clinical_notes.ilike(pattern),
                LabOrderModel.status.ilike(pattern),
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
                .select_from(LabOrderModel)
                .join(patient, LabOrderModel.patient_id == patient.id)
                .join(doctor, LabOrderModel.doctor_id == doctor.id)
                .join(consultation, LabOrderModel.consultation_id == consultation.id)
                .where(conditions)
            )
        ).scalar_one()

        offset = (page - 1) * page_size
        result = await self._session.execute(
            stmt.where(conditions)
            .order_by(LabOrderModel.created_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        items = [self._map_row(row) for row in result.all()]
        return LabOrderPage(items=items, total=total, page=page, page_size=page_size)
