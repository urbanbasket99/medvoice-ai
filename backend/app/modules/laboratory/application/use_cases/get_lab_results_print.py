from uuid import UUID

from app.modules.laboratory.application.dto.lab_order_dto import LabResultsPrintItem, LabResultsPrintOutput
from app.modules.laboratory.domain.exceptions import LabOrderNotFoundError
from app.modules.laboratory.domain.repositories.lab_order_repository import LabOrderRepository


class GetLabResultsPrintUseCase:
    def __init__(self, lab_order_repository: LabOrderRepository) -> None:
        self._lab_orders = lab_order_repository

    async def execute(self, lab_order_id: UUID) -> LabResultsPrintOutput:
        lab_order = await self._lab_orders.get_by_id(lab_order_id)
        if lab_order is None:
            raise LabOrderNotFoundError("Lab order not found.")

        items = [
            LabResultsPrintItem(
                lab_test_name=item.lab_test_name,
                category=item.category,
                sample_type=item.sample_type.value,
                result_value=item.result_value,
                result_unit=item.result_unit,
                reference_range=item.reference_range,
                result_flag=item.result_flag.value if item.result_flag else None,
                result_notes=item.result_notes,
                resulted_at=item.resulted_at,
            )
            for item in sorted(lab_order.items or [], key=lambda row: row.sort_order)
        ]

        return LabResultsPrintOutput(
            lab_order_id=lab_order.id,
            order_number=lab_order.order_number,
            consultation_id=lab_order.consultation_id,
            status=lab_order.status.value,
            patient_name=lab_order.patient_name,
            patient_mrn=lab_order.patient_mrn,
            patient_uhid=lab_order.patient_uhid,
            patient_gender=lab_order.patient_gender,
            patient_date_of_birth=lab_order.patient_date_of_birth,
            doctor_name=lab_order.doctor_name,
            doctor_code=lab_order.doctor_code,
            doctor_specialization=lab_order.doctor_specialization,
            consultation_visit_number=lab_order.consultation_visit_number,
            items=items,
            created_at=lab_order.created_at,
        )
