from datetime import UTC, date, datetime
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import and_, delete, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased, selectinload

from app.infrastructure.models.user import UserModel
from app.modules.billing.domain.entities.billing_entities import Invoice
from app.modules.billing.domain.repositories.invoice_repository import InvoiceRepository
from app.modules.billing.domain.value_objects import (
    CollectionReportGroupBy,
    CollectionReportRow,
    InvoiceListCriteria,
    InvoicePage,
    InvoiceStatus,
    SortDirection,
)
from app.modules.billing.infrastructure.models.billing_model import (
    InvoiceItemModel,
    InvoiceModel,
    InvoiceStatusEventModel,
    PaymentModel,
)
from app.modules.billing.infrastructure.repositories.mappers import (
    invoice_item_to_model,
    invoice_status_event_to_model,
    invoice_to_entity,
)
from app.modules.consultations.infrastructure.models.consultation_model import ConsultationModel
from app.modules.doctors.infrastructure.models.doctor_model import DoctorModel
from app.modules.patients.infrastructure.models.patient_model import PatientModel

_SORT_COLUMNS = {
    "created_at": InvoiceModel.created_at,
    "updated_at": InvoiceModel.updated_at,
    "invoice_number": InvoiceModel.invoice_number,
    "invoice_date": InvoiceModel.invoice_date,
    "grand_total": InvoiceModel.grand_total,
}

_OUTSTANDING_STATUSES = [InvoiceStatus.ISSUED.value, InvoiceStatus.PARTIALLY_PAID.value]


class SqlAlchemyInvoiceRepository(InvoiceRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    def _base_select(self):
        patient = aliased(PatientModel)
        doctor = aliased(DoctorModel)
        consultation = aliased(ConsultationModel)
        stmt = (
            select(InvoiceModel, patient, doctor, consultation)
            .options(
                selectinload(InvoiceModel.items),
                selectinload(InvoiceModel.payments),
                selectinload(InvoiceModel.status_events),
                selectinload(InvoiceModel.insurance_claims),
            )
            .join(patient, InvoiceModel.patient_id == patient.id)
            .join(doctor, InvoiceModel.doctor_id == doctor.id)
            .outerjoin(consultation, InvoiceModel.consultation_id == consultation.id)
        )
        return stmt, patient, doctor, consultation

    def _map_row(self, row) -> Invoice:
        model, patient, doctor, consultation = row
        return invoice_to_entity(model, patient, doctor, consultation)

    async def get_by_id(self, invoice_id: UUID) -> Invoice | None:
        stmt, _, _, _ = self._base_select()
        result = await self._session.execute(
            stmt.where(
                InvoiceModel.id == invoice_id,
                InvoiceModel.deleted_at.is_(None),
            )
        )
        row = result.first()
        return self._map_row(row) if row else None

    async def create(self, invoice: Invoice) -> Invoice:
        model = InvoiceModel(
            id=invoice.id,
            invoice_number=invoice.invoice_number,
            consultation_id=invoice.consultation_id,
            admission_id=invoice.admission_id,
            patient_id=invoice.patient_id,
            doctor_id=invoice.doctor_id,
            invoice_date=invoice.invoice_date,
            status=invoice.status.value,
            subtotal=invoice.subtotal,
            discount_amount=invoice.discount_amount,
            tax_amount=invoice.tax_amount,
            grand_total=invoice.grand_total,
            paid_amount=invoice.paid_amount,
            balance=invoice.balance,
            notes=invoice.notes,
            is_provisional=invoice.is_provisional,
            is_tpa=invoice.is_tpa,
            tpa_id=invoice.tpa_id,
        )
        if invoice.items:
            model.items = [invoice_item_to_model(item) for item in invoice.items]
        if invoice.status_events:
            model.status_events = [invoice_status_event_to_model(e) for e in invoice.status_events]
        self._session.add(model)
        await self._session.flush()
        created = await self.get_by_id(model.id)
        assert created is not None
        return created

    async def update(self, invoice: Invoice) -> Invoice:
        await self._session.execute(
            update(InvoiceModel)
            .where(InvoiceModel.id == invoice.id)
            .values(
                invoice_date=invoice.invoice_date,
                status=invoice.status.value,
                subtotal=invoice.subtotal,
                discount_amount=invoice.discount_amount,
                tax_amount=invoice.tax_amount,
                grand_total=invoice.grand_total,
                paid_amount=invoice.paid_amount,
                balance=invoice.balance,
                notes=invoice.notes,
                is_provisional=invoice.is_provisional,
                is_tpa=invoice.is_tpa,
                tpa_id=invoice.tpa_id,
                updated_at=invoice.updated_at,
            )
        )
        await self._session.execute(
            delete(InvoiceItemModel).where(InvoiceItemModel.invoice_id == invoice.id)
        )
        if invoice.items:
            for item in invoice.items:
                self._session.add(invoice_item_to_model(item))
        await self._session.flush()
        updated = await self.get_by_id(invoice.id)
        assert updated is not None
        return updated

    async def update_status(
        self,
        invoice_id: UUID,
        status: InvoiceStatus,
        notes: str | None = None,
    ) -> Invoice:
        now = datetime.now(UTC)
        await self._session.execute(
            update(InvoiceModel)
            .where(InvoiceModel.id == invoice_id)
            .values(status=status.value, updated_at=now)
        )
        self._session.add(
            InvoiceStatusEventModel(
                id=uuid4(),
                invoice_id=invoice_id,
                status=status.value,
                notes=notes,
                changed_at=now,
            )
        )
        await self._session.flush()
        updated = await self.get_by_id(invoice_id)
        assert updated is not None
        return updated

    async def soft_delete(self, invoice_id: UUID) -> bool:
        result = await self._session.execute(
            update(InvoiceModel)
            .where(
                InvoiceModel.id == invoice_id,
                InvoiceModel.deleted_at.is_(None),
            )
            .values(deleted_at=func.now())
        )
        return (result.rowcount or 0) > 0

    async def list_invoices(self, criteria: InvoiceListCriteria) -> InvoicePage:
        stmt, _, _, _ = self._base_select()
        conditions = [InvoiceModel.deleted_at.is_(None)]

        if criteria.consultation_id is not None:
            conditions.append(InvoiceModel.consultation_id == criteria.consultation_id)
        if criteria.patient_id is not None:
            conditions.append(InvoiceModel.patient_id == criteria.patient_id)
        if criteria.doctor_id is not None:
            conditions.append(InvoiceModel.doctor_id == criteria.doctor_id)
        if criteria.status is not None:
            conditions.append(InvoiceModel.status == criteria.status.value)

        sort_column = _SORT_COLUMNS.get(criteria.sort_by.value, InvoiceModel.created_at)
        order = sort_column.asc() if criteria.sort_dir == SortDirection.ASC else sort_column.desc()

        count_stmt = select(func.count()).select_from(InvoiceModel).where(and_(*conditions))
        total = (await self._session.execute(count_stmt)).scalar_one()

        offset = (criteria.page - 1) * criteria.page_size
        result = await self._session.execute(
            stmt.where(and_(*conditions)).order_by(order).offset(offset).limit(criteria.page_size)
        )
        items = [self._map_row(row) for row in result.all()]
        return InvoicePage(items=items, total=total, page=criteria.page, page_size=criteria.page_size)

    async def search_invoices(self, query: str, page: int, page_size: int) -> InvoicePage:
        stmt, patient, doctor, consultation = self._base_select()
        pattern = f"%{query}%"
        conditions = and_(
            InvoiceModel.deleted_at.is_(None),
            or_(
                InvoiceModel.invoice_number.ilike(pattern),
                InvoiceModel.status.ilike(pattern),
                InvoiceModel.notes.ilike(pattern),
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
                .select_from(InvoiceModel)
                .join(patient, InvoiceModel.patient_id == patient.id)
                .join(doctor, InvoiceModel.doctor_id == doctor.id)
                .outerjoin(consultation, InvoiceModel.consultation_id == consultation.id)
                .where(conditions)
            )
        ).scalar_one()

        offset = (page - 1) * page_size
        result = await self._session.execute(
            stmt.where(conditions)
            .order_by(InvoiceModel.created_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        items = [self._map_row(row) for row in result.all()]
        return InvoicePage(items=items, total=total, page=page, page_size=page_size)

    async def list_outstanding(self, page: int, page_size: int) -> InvoicePage:
        stmt, _, _, _ = self._base_select()
        conditions = and_(
            InvoiceModel.deleted_at.is_(None),
            InvoiceModel.balance > 0,
            InvoiceModel.status.in_(_OUTSTANDING_STATUSES),
        )

        total = (
            await self._session.execute(
                select(func.count()).select_from(InvoiceModel).where(conditions)
            )
        ).scalar_one()

        offset = (page - 1) * page_size
        result = await self._session.execute(
            stmt.where(conditions)
            .order_by(InvoiceModel.created_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        items = [self._map_row(row) for row in result.all()]
        return InvoicePage(items=items, total=total, page=page, page_size=page_size)

    async def get_collection_report(
        self,
        date_from: date,
        date_to: date,
        group_by: CollectionReportGroupBy,
    ) -> list[CollectionReportRow]:
        base_filter = and_(
            InvoiceModel.deleted_at.is_(None),
            InvoiceModel.invoice_date >= date_from,
            InvoiceModel.invoice_date <= date_to,
        )

        if group_by == CollectionReportGroupBy.DOCTOR:
            stmt = (
                select(
                    InvoiceModel.doctor_id,
                    DoctorModel.full_name,
                    func.count(InvoiceModel.id),
                    func.coalesce(func.sum(InvoiceModel.grand_total), 0),
                    func.coalesce(func.sum(InvoiceModel.paid_amount), 0),
                    func.coalesce(func.sum(InvoiceModel.balance), 0),
                )
                .join(DoctorModel, InvoiceModel.doctor_id == DoctorModel.id)
                .where(base_filter)
                .group_by(InvoiceModel.doctor_id, DoctorModel.full_name)
                .order_by(DoctorModel.full_name)
            )
            result = await self._session.execute(stmt)
            return [
                CollectionReportRow(
                    group_key=str(row[0]),
                    group_label=row[1] or "Unknown",
                    invoice_count=int(row[2]),
                    total_billed=Decimal(str(row[3])),
                    total_collected=Decimal(str(row[4])),
                    outstanding=Decimal(str(row[5])),
                )
                for row in result.all()
            ]

        if group_by == CollectionReportGroupBy.DATE:
            stmt = (
                select(
                    InvoiceModel.invoice_date,
                    func.count(InvoiceModel.id),
                    func.coalesce(func.sum(InvoiceModel.grand_total), 0),
                    func.coalesce(func.sum(InvoiceModel.paid_amount), 0),
                    func.coalesce(func.sum(InvoiceModel.balance), 0),
                )
                .where(base_filter)
                .group_by(InvoiceModel.invoice_date)
                .order_by(InvoiceModel.invoice_date)
            )
            result = await self._session.execute(stmt)
            return [
                CollectionReportRow(
                    group_key=row[0].isoformat(),
                    group_label=row[0].isoformat(),
                    invoice_count=int(row[1]),
                    total_billed=Decimal(str(row[2])),
                    total_collected=Decimal(str(row[3])),
                    outstanding=Decimal(str(row[4])),
                )
                for row in result.all()
            ]

        # group_by == USER
        payment_date = func.date(PaymentModel.payment_date)
        stmt = (
            select(PaymentModel, InvoiceModel, UserModel)
            .join(InvoiceModel, PaymentModel.invoice_id == InvoiceModel.id)
            .outerjoin(UserModel, PaymentModel.collected_by == UserModel.id)
            .where(
                InvoiceModel.deleted_at.is_(None),
                payment_date >= date_from,
                payment_date <= date_to,
            )
        )
        result = await self._session.execute(stmt)

        buckets: dict[str, dict] = {}
        for payment, invoice, user in result.all():
            key = str(payment.collected_by) if payment.collected_by else "unassigned"
            if key not in buckets:
                buckets[key] = {
                    "label": user.full_name if user else "Unassigned",
                    "invoice_ids": set(),
                    "invoices": {},
                    "collected": Decimal("0"),
                }
            buckets[key]["collected"] += Decimal(str(payment.amount))
            buckets[key]["invoice_ids"].add(invoice.id)
            buckets[key]["invoices"][invoice.id] = invoice

        rows: list[CollectionReportRow] = []
        for key, bucket in sorted(buckets.items(), key=lambda item: item[1]["label"] or ""):
            invoices = bucket["invoices"].values()
            rows.append(
                CollectionReportRow(
                    group_key=key,
                    group_label=bucket["label"],
                    invoice_count=len(bucket["invoice_ids"]),
                    total_billed=sum(
                        (Decimal(str(inv.grand_total)) for inv in invoices), Decimal("0")
                    ),
                    total_collected=bucket["collected"],
                    outstanding=sum(
                        (Decimal(str(inv.balance)) for inv in invoices), Decimal("0")
                    ),
                )
            )
        return rows
