from uuid import UUID

from app.modules.pharmacy.application.dto.pharmacy_dto import DispenseItemInput, DispensePrintOutput
from app.modules.pharmacy.domain.exceptions import DispenseRecordNotFoundError
from app.modules.pharmacy.domain.repositories.dispense_record_repository import DispenseRecordRepository


class GetDispensePrintUseCase:
    def __init__(self, dispense_repository: DispenseRecordRepository) -> None:
        self._dispenses = dispense_repository

    async def execute(self, dispense_id: UUID) -> DispensePrintOutput:
        dispense = await self._dispenses.get_by_id(dispense_id)
        if dispense is None:
            raise DispenseRecordNotFoundError("Dispense record not found.")

        items = tuple(
            DispenseItemInput(
                prescription_item_id=item.prescription_item_id,
                medicine_id=item.medicine_id,
                batch_id=item.batch_id,
                medicine_name=item.medicine_name,
                quantity=item.quantity,
                unit_price=item.unit_price,
                instructions=item.instructions,
                sort_order=item.sort_order,
            )
            for item in (dispense.items or [])
        )

        dispensed_date = dispense.dispensed_at.date() if dispense.dispensed_at else None

        return DispensePrintOutput(
            order_number=dispense.order_number,
            status=dispense.status,
            patient_name=dispense.patient_name,
            patient_mrn=dispense.patient_mrn,
            doctor_name=dispense.doctor_name,
            doctor_code=dispense.doctor_code,
            consultation_visit_number=dispense.consultation_visit_number,
            created_at=dispense.created_at,
            dispensed_at=dispensed_date,
            notes=dispense.notes,
            items=items,
        )
