from decimal import Decimal
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.billing.application.dto.billing_dto import InvoiceItemSuggestion
from app.modules.billing.application.interfaces.consultation_charge_lookup import ConsultationChargeLookup
from app.modules.billing.domain.value_objects import BillingDepartment, ReferenceType
from app.modules.laboratory.infrastructure.models.lab_order_model import (
    LabOrderItemModel,
    LabOrderModel,
    LabTestMasterModel,
)
from app.modules.pharmacy.infrastructure.models.pharmacy_model import (
    DispenseItemModel,
    DispenseRecordModel,
)
from app.modules.radiology.infrastructure.models.radiology_order_model import (
    RadiologyOrderItemModel,
    RadiologyOrderModel,
    RadiologyTestMasterModel,
)


class SqlAlchemyConsultationChargeLookup(ConsultationChargeLookup):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_suggested_items(self, consultation_id: UUID) -> list[InvoiceItemSuggestion]:
        suggestions: list[InvoiceItemSuggestion] = []

        # --- Lab orders ---
        lab_result = await self._session.execute(
            select(LabOrderModel)
            .options(selectinload(LabOrderModel.items))
            .where(
                LabOrderModel.consultation_id == consultation_id,
                LabOrderModel.deleted_at.is_(None),
            )
        )
        for lab_order in lab_result.scalars().all():
            for item in lab_order.items:
                price = Decimal("0")
                if item.lab_test_master_id is not None:
                    master = await self._session.get(LabTestMasterModel, item.lab_test_master_id)
                    if master is not None and master.price is not None:
                        price = master.price
                suggestions.append(
                    InvoiceItemSuggestion(
                        service_name=item.lab_test_name,
                        department=BillingDepartment.LABORATORY,
                        quantity=1,
                        unit_price=price,
                        reference_type=ReferenceType.LAB_ORDER,
                        reference_id=item.id,
                    )
                )

        # --- Radiology orders ---
        rad_result = await self._session.execute(
            select(RadiologyOrderModel)
            .options(selectinload(RadiologyOrderModel.items))
            .where(
                RadiologyOrderModel.consultation_id == consultation_id,
                RadiologyOrderModel.deleted_at.is_(None),
            )
        )
        for rad_order in rad_result.scalars().all():
            for item in rad_order.items:
                price = Decimal("0")
                if item.radiology_test_master_id is not None:
                    master = await self._session.get(RadiologyTestMasterModel, item.radiology_test_master_id)
                    if master is not None and master.price is not None:
                        price = master.price
                suggestions.append(
                    InvoiceItemSuggestion(
                        service_name=item.test_name,
                        department=BillingDepartment.RADIOLOGY,
                        quantity=1,
                        unit_price=price,
                        reference_type=ReferenceType.RADIOLOGY_ORDER,
                        reference_id=item.id,
                    )
                )

        # --- Dispense records ---
        dispense_result = await self._session.execute(
            select(DispenseRecordModel)
            .options(selectinload(DispenseRecordModel.items))
            .where(
                DispenseRecordModel.consultation_id == consultation_id,
                DispenseRecordModel.deleted_at.is_(None),
            )
        )
        for dispense in dispense_result.scalars().all():
            for item in dispense.items:
                suggestions.append(
                    InvoiceItemSuggestion(
                        service_name=item.medicine_name,
                        department=BillingDepartment.PHARMACY,
                        quantity=item.quantity,
                        unit_price=item.unit_price or Decimal("0"),
                        reference_type=ReferenceType.DISPENSE_RECORD,
                        reference_id=item.id,
                    )
                )

        return suggestions
