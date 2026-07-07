from datetime import UTC, datetime
from uuid import UUID, uuid4

from sqlalchemy import and_, delete, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased, selectinload

from app.modules.consultations.infrastructure.models.consultation_model import ConsultationModel
from app.modules.doctors.infrastructure.models.doctor_model import DoctorModel
from app.modules.patients.infrastructure.models.patient_model import PatientModel
from app.modules.pharmacy.domain.entities.dispense_record import DispenseRecord
from app.modules.pharmacy.domain.repositories.dispense_record_repository import DispenseRecordRepository
from app.modules.pharmacy.domain.value_objects import DispenseListCriteria, DispensePage, DispenseStatus, SortDirection
from app.modules.pharmacy.infrastructure.models.pharmacy_model import (
    DispenseItemModel,
    DispenseRecordModel,
    DispenseStatusEventModel,
)
from app.modules.pharmacy.infrastructure.repositories.mappers import (
    dispense_item_to_model,
    dispense_record_to_entity,
    dispense_status_event_to_model,
)

_SORT_COLUMNS = {
    "created_at": DispenseRecordModel.created_at,
    "updated_at": DispenseRecordModel.updated_at,
    "order_number": DispenseRecordModel.order_number,
}


class SqlAlchemyDispenseRecordRepository(DispenseRecordRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    def _base_select(self):
        patient = aliased(PatientModel)
        doctor = aliased(DoctorModel)
        consultation = aliased(ConsultationModel)
        stmt = (
            select(DispenseRecordModel, patient, doctor, consultation)
            .options(
                selectinload(DispenseRecordModel.items),
                selectinload(DispenseRecordModel.status_history),
            )
            .join(patient, DispenseRecordModel.patient_id == patient.id)
            .join(doctor, DispenseRecordModel.doctor_id == doctor.id)
            .join(consultation, DispenseRecordModel.consultation_id == consultation.id)
        )
        return stmt, patient, doctor, consultation

    def _map_row(self, row) -> DispenseRecord:
        model, patient, doctor, consultation = row
        return dispense_record_to_entity(model, patient, doctor, consultation)

    async def get_by_id(self, dispense_id: UUID) -> DispenseRecord | None:
        stmt, _, _, _ = self._base_select()
        result = await self._session.execute(
            stmt.where(
                DispenseRecordModel.id == dispense_id,
                DispenseRecordModel.deleted_at.is_(None),
            )
        )
        row = result.first()
        return self._map_row(row) if row else None

    async def create(self, dispense: DispenseRecord) -> DispenseRecord:
        model = DispenseRecordModel(
            id=dispense.id,
            prescription_id=dispense.prescription_id,
            consultation_id=dispense.consultation_id,
            patient_id=dispense.patient_id,
            doctor_id=dispense.doctor_id,
            order_number=dispense.order_number,
            status=dispense.status.value,
            notes=dispense.notes,
            dispensed_by=dispense.dispensed_by,
            dispensed_at=dispense.dispensed_at,
        )
        if dispense.items:
            model.items = [dispense_item_to_model(item) for item in dispense.items]
        if dispense.status_history:
            model.status_history = [
                dispense_status_event_to_model(event) for event in dispense.status_history
            ]
        self._session.add(model)
        await self._session.flush()
        created = await self.get_by_id(model.id)
        assert created is not None
        return created

    async def update(self, dispense: DispenseRecord) -> DispenseRecord:
        await self._session.execute(
            update(DispenseRecordModel)
            .where(DispenseRecordModel.id == dispense.id)
            .values(notes=dispense.notes)
        )
        await self._session.execute(
            delete(DispenseItemModel).where(DispenseItemModel.dispense_id == dispense.id)
        )
        if dispense.items:
            for item in dispense.items:
                self._session.add(dispense_item_to_model(item))
        await self._session.flush()
        updated = await self.get_by_id(dispense.id)
        assert updated is not None
        return updated

    async def update_status(
        self,
        dispense_id: UUID,
        status: DispenseStatus,
        notes: str | None = None,
        dispensed_by: UUID | None = None,
    ) -> DispenseRecord:
        now = datetime.now(UTC)
        values: dict = {"status": status.value, "updated_at": now}
        if status == DispenseStatus.DISPENSED:
            values["dispensed_at"] = now
            if dispensed_by is not None:
                values["dispensed_by"] = dispensed_by

        await self._session.execute(
            update(DispenseRecordModel).where(DispenseRecordModel.id == dispense_id).values(**values)
        )
        self._session.add(
            DispenseStatusEventModel(
                id=uuid4(),
                dispense_id=dispense_id,
                status=status.value,
                notes=notes,
                changed_at=now,
            )
        )
        await self._session.flush()
        updated = await self.get_by_id(dispense_id)
        assert updated is not None
        return updated

    async def soft_delete(self, dispense_id: UUID) -> bool:
        result = await self._session.execute(
            update(DispenseRecordModel)
            .where(
                DispenseRecordModel.id == dispense_id,
                DispenseRecordModel.deleted_at.is_(None),
            )
            .values(deleted_at=func.now())
        )
        return (result.rowcount or 0) > 0

    async def list_dispenses(self, criteria: DispenseListCriteria) -> DispensePage:
        stmt, _, _, _ = self._base_select()
        conditions = [DispenseRecordModel.deleted_at.is_(None)]

        if criteria.prescription_id is not None:
            conditions.append(DispenseRecordModel.prescription_id == criteria.prescription_id)
        if criteria.consultation_id is not None:
            conditions.append(DispenseRecordModel.consultation_id == criteria.consultation_id)
        if criteria.patient_id is not None:
            conditions.append(DispenseRecordModel.patient_id == criteria.patient_id)
        if criteria.doctor_id is not None:
            conditions.append(DispenseRecordModel.doctor_id == criteria.doctor_id)
        if criteria.status is not None:
            conditions.append(DispenseRecordModel.status == criteria.status.value)

        sort_column = _SORT_COLUMNS.get(criteria.sort_by.value, DispenseRecordModel.created_at)
        order = sort_column.asc() if criteria.sort_dir == SortDirection.ASC else sort_column.desc()

        count_stmt = select(func.count()).select_from(DispenseRecordModel).where(and_(*conditions))
        total = int((await self._session.execute(count_stmt)).scalar_one())

        offset = (criteria.page - 1) * criteria.page_size
        result = await self._session.execute(
            stmt.where(and_(*conditions)).order_by(order).offset(offset).limit(criteria.page_size)
        )
        items = [self._map_row(row) for row in result.all()]
        return DispensePage(items=items, total=total, page=criteria.page, page_size=criteria.page_size)

    async def search_dispenses(self, query: str, page: int, page_size: int) -> DispensePage:
        stmt, patient, doctor, consultation = self._base_select()
        pattern = f"%{query}%"
        conditions = and_(
            DispenseRecordModel.deleted_at.is_(None),
            or_(
                DispenseRecordModel.order_number.ilike(pattern),
                DispenseRecordModel.notes.ilike(pattern),
                DispenseRecordModel.status.ilike(pattern),
                patient.first_name.ilike(pattern),
                patient.last_name.ilike(pattern),
                patient.mrn.ilike(pattern),
                doctor.full_name.ilike(pattern),
                doctor.doctor_code.ilike(pattern),
                consultation.visit_number.ilike(pattern),
            ),
        )

        total = int(
            (
                await self._session.execute(
                    select(func.count())
                    .select_from(DispenseRecordModel)
                    .join(patient, DispenseRecordModel.patient_id == patient.id)
                    .join(doctor, DispenseRecordModel.doctor_id == doctor.id)
                    .join(consultation, DispenseRecordModel.consultation_id == consultation.id)
                    .where(conditions)
                )
            ).scalar_one()
        )

        offset = (page - 1) * page_size
        result = await self._session.execute(
            stmt.where(conditions)
            .order_by(DispenseRecordModel.created_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        items = [self._map_row(row) for row in result.all()]
        return DispensePage(items=items, total=total, page=page, page_size=page_size)

    async def list_by_prescription(self, prescription_id: UUID) -> list[DispenseRecord]:
        stmt, _, _, _ = self._base_select()
        result = await self._session.execute(
            stmt.where(
                DispenseRecordModel.prescription_id == prescription_id,
                DispenseRecordModel.deleted_at.is_(None),
            ).order_by(DispenseRecordModel.created_at.desc())
        )
        return [self._map_row(row) for row in result.all()]
