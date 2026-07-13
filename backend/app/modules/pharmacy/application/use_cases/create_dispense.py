from datetime import UTC, datetime
from uuid import UUID, uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.patients.infrastructure.models.patient_model import PatientModel
from app.modules.pharmacy.application.dto.pharmacy_dto import (
    CreateDispenseInput,
    DispenseItemInput,
    PrescriptionContext,
    PrescriptionItemContext,
)
from app.modules.pharmacy.application.interfaces.pharmacy_dispense_number_generator import (
    PharmacyDispenseNumberGenerator,
)
from app.modules.pharmacy.application.interfaces.prescription_lookup import PrescriptionLookup
from app.modules.pharmacy.domain.entities.dispense_record import (
    DispenseItem,
    DispenseRecord,
    DispenseStatusEvent,
)
from app.modules.patients.domain.exceptions import PatientNotFoundError
from app.modules.prescriptions.domain.exceptions import PrescriptionNotFoundError
from app.modules.pharmacy.domain.repositories.dispense_record_repository import DispenseRecordRepository
from app.modules.pharmacy.domain.repositories.pharmacy_stock_repository import PharmacyStockRepository
from app.modules.pharmacy.domain.value_objects import DispenseStatus, DispenseType


def _parse_quantity(quantity_str: str | None) -> int:
    if not quantity_str:
        return 1
    digits = "".join(c for c in quantity_str if c.isdigit())
    return int(digits) if digits else 1


def _items_from_prescription(context: PrescriptionContext) -> list[DispenseItemInput]:
    items: list[DispenseItemInput] = []
    for index, item in enumerate(context.items):
        items.append(
            DispenseItemInput(
                prescription_item_id=item.id,
                medicine_name=item.medicine_name,
                quantity=_parse_quantity(item.quantity),
                instructions=item.instructions,
                sort_order=index,
            )
        )
    return items


def _build_dispense_items(
    dispense_id: UUID, items: tuple[DispenseItemInput, ...]
) -> list[DispenseItem]:
    built: list[DispenseItem] = []
    for index, item in enumerate(items):
        built.append(
            DispenseItem(
                id=uuid4(),
                dispense_id=dispense_id,
                prescription_item_id=item.prescription_item_id,
                medicine_id=item.medicine_id,
                batch_id=item.batch_id,
                medicine_name=item.medicine_name,
                quantity=item.quantity,
                unit_price=item.unit_price,
                instructions=item.instructions,
                sort_order=item.sort_order if item.sort_order else index,
            )
        )
    return built


async def _apply_dispense_stock(
    stock_repository: PharmacyStockRepository,
    items: list[DispenseItem],
    dispense_id: UUID,
    dispensed_by: UUID | None,
) -> None:
    for item in items:
        if item.medicine_id and item.quantity > 0:
            await stock_repository.decrement_for_dispense(
                medicine_id=item.medicine_id,
                batch_id=item.batch_id,
                quantity=item.quantity,
                dispense_id=dispense_id,
                created_by=dispensed_by,
            )


class CreateDispenseUseCase:
    def __init__(
        self,
        dispense_repository: DispenseRecordRepository,
        prescription_lookup: PrescriptionLookup,
        order_number_generator: PharmacyDispenseNumberGenerator,
        stock_repository: PharmacyStockRepository,
        session: AsyncSession,
    ) -> None:
        self._dispenses = dispense_repository
        self._prescriptions = prescription_lookup
        self._order_numbers = order_number_generator
        self._stock = stock_repository
        self._session = session

    async def _ensure_patient_exists(self, patient_id: UUID) -> None:
        result = await self._session.execute(
            select(PatientModel.id).where(
                PatientModel.id == patient_id,
                PatientModel.deleted_at.is_(None),
            )
        )
        if result.scalar_one_or_none() is None:
            raise PatientNotFoundError("Patient not found.")

    async def execute(self, data: CreateDispenseInput) -> DispenseRecord:
        now = datetime.now(UTC)
        dispense_id = uuid4()
        order_number = await self._order_numbers.generate()

        is_retail = data.dispense_type == DispenseType.RETAIL or data.prescription_id is None

        if is_retail:
            if data.patient_id is None:
                raise ValueError("patient_id is required for retail dispense.")
            await self._ensure_patient_exists(data.patient_id)
            if not data.items:
                raise ValueError("Retail dispense requires at least one item.")
            item_inputs = data.items
            dispense = DispenseRecord(
                id=dispense_id,
                dispense_type=DispenseType.RETAIL,
                patient_id=data.patient_id,
                prescription_id=None,
                consultation_id=None,
                doctor_id=None,
                order_number=order_number,
                status=data.status,
                created_at=now,
                updated_at=now,
                dispensed_by=data.dispensed_by if data.status == DispenseStatus.DISPENSED else None,
                notes=data.notes,
                dispensed_at=now if data.status == DispenseStatus.DISPENSED else None,
                items=_build_dispense_items(dispense_id, item_inputs),
                status_history=[
                    DispenseStatusEvent(
                        id=uuid4(),
                        dispense_id=dispense_id,
                        status=data.status,
                        notes=data.notes or "Retail dispense created.",
                        changed_at=now,
                    )
                ],
            )
        else:
            if data.prescription_id is None:
                raise PrescriptionNotFoundError("Prescription is required for prescription dispense.")
            context = await self._prescriptions.get_prescription_context(data.prescription_id)
            if context is None:
                raise PrescriptionNotFoundError("Prescription not found.")

            if data.items:
                item_inputs = data.items
            else:
                item_inputs = tuple(_items_from_prescription(context))

            items = _build_dispense_items(dispense_id, item_inputs)
            dispensed_at = now if data.status == DispenseStatus.DISPENSED else None

            dispense = DispenseRecord(
                id=dispense_id,
                dispense_type=DispenseType.PRESCRIPTION,
                prescription_id=context.prescription_id,
                consultation_id=context.consultation_id,
                patient_id=context.patient_id,
                doctor_id=context.doctor_id,
                order_number=order_number,
                status=data.status,
                created_at=now,
                updated_at=now,
                dispensed_by=data.dispensed_by if data.status == DispenseStatus.DISPENSED else None,
                notes=data.notes,
                dispensed_at=dispensed_at,
                items=items,
                status_history=[
                    DispenseStatusEvent(
                        id=uuid4(),
                        dispense_id=dispense_id,
                        status=data.status,
                        notes=data.notes or "Dispense record created.",
                        changed_at=now,
                    )
                ],
            )

        created = await self._dispenses.create(dispense)

        if data.status == DispenseStatus.DISPENSED and created.items:
            await _apply_dispense_stock(
                self._stock, created.items, dispense_id, data.dispensed_by
            )

        return created
