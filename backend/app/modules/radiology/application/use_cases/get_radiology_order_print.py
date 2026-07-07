from uuid import UUID

from app.modules.radiology.application.dto.radiology_order_dto import (
    RadiologyOrderPrintItem,
    RadiologyOrderPrintOutput,
)
from app.modules.radiology.domain.exceptions import RadiologyOrderNotFoundError
from app.modules.radiology.domain.repositories.radiology_order_repository import RadiologyOrderRepository


class GetRadiologyOrderPrintUseCase:
    def __init__(self, radiology_order_repository: RadiologyOrderRepository) -> None:
        self._radiology_orders = radiology_order_repository

    async def execute(self, radiology_order_id: UUID) -> RadiologyOrderPrintOutput:
        radiology_order = await self._radiology_orders.get_by_id(radiology_order_id)
        if radiology_order is None:
            raise RadiologyOrderNotFoundError("Radiology order not found.")

        items = [
            RadiologyOrderPrintItem(
                test_name=item.test_name,
                category=item.category.value,
                body_part=item.body_part,
                contrast_required=item.contrast_required,
                instructions=item.instructions,
            )
            for item in sorted(radiology_order.items or [], key=lambda row: row.sort_order)
        ]

        return RadiologyOrderPrintOutput(
            radiology_order_id=radiology_order.id,
            order_number=radiology_order.order_number,
            consultation_id=radiology_order.consultation_id,
            priority=radiology_order.priority.value,
            status=radiology_order.status.value,
            clinical_notes=radiology_order.clinical_notes,
            patient_name=radiology_order.patient_name,
            patient_mrn=radiology_order.patient_mrn,
            patient_uhid=radiology_order.patient_uhid,
            patient_gender=radiology_order.patient_gender,
            patient_date_of_birth=radiology_order.patient_date_of_birth,
            doctor_name=radiology_order.doctor_name,
            doctor_code=radiology_order.doctor_code,
            doctor_specialization=radiology_order.doctor_specialization,
            consultation_visit_number=radiology_order.consultation_visit_number,
            items=items,
            created_at=radiology_order.created_at,
        )
