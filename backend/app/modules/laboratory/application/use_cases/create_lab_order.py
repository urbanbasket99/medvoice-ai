from datetime import UTC, datetime
from uuid import UUID, uuid4

from app.modules.laboratory.application.dto.lab_order_dto import CreateLabOrderInput, LabOrderItemInput
from app.modules.laboratory.application.interfaces.consultation_lookup import ConsultationLookup
from app.modules.laboratory.application.interfaces.lab_order_number_generator import LabOrderNumberGenerator
from app.modules.laboratory.domain.entities.lab_order import LabOrder, LabOrderItem, LabOrderStatusEvent
from app.modules.laboratory.domain.exceptions import LabOrderConsultationNotFoundError
from app.modules.laboratory.domain.repositories.lab_order_repository import LabOrderRepository
from app.modules.laboratory.domain.value_objects import LabStatus


def _build_items(lab_order_id: UUID, items: tuple[LabOrderItemInput, ...]) -> list[LabOrderItem]:
    built: list[LabOrderItem] = []
    for index, item in enumerate(items):
        built.append(
            LabOrderItem(
                id=uuid4(),
                lab_order_id=lab_order_id,
                lab_test_master_id=item.lab_test_master_id,
                lab_test_name=item.lab_test_name,
                category=item.category,
                sample_type=item.sample_type,
                instructions=item.instructions,
                sort_order=item.sort_order if item.sort_order else index,
            )
        )
    return built


class CreateLabOrderUseCase:
    def __init__(
        self,
        lab_order_repository: LabOrderRepository,
        consultation_lookup: ConsultationLookup,
        order_number_generator: LabOrderNumberGenerator,
    ) -> None:
        self._lab_orders = lab_order_repository
        self._consultations = consultation_lookup
        self._order_numbers = order_number_generator

    async def execute(self, data: CreateLabOrderInput) -> LabOrder:
        context = await self._consultations.get_consultation_context(data.consultation_id)
        if context is None:
            raise LabOrderConsultationNotFoundError("The selected consultation does not exist.")

        now = datetime.now(UTC)
        lab_order_id = uuid4()
        order_number = await self._order_numbers.generate()
        initial_status = LabStatus.ORDERED

        lab_order = LabOrder(
            id=lab_order_id,
            consultation_id=context.consultation_id,
            patient_id=context.patient_id,
            doctor_id=context.doctor_id,
            order_number=order_number,
            priority=data.priority,
            clinical_notes=data.clinical_notes,
            status=initial_status,
            created_at=now,
            updated_at=now,
            items=_build_items(lab_order_id, data.items),
            status_history=[
                LabOrderStatusEvent(
                    id=uuid4(),
                    lab_order_id=lab_order_id,
                    status=initial_status,
                    notes="Lab order created.",
                    changed_at=now,
                )
            ],
        )
        return await self._lab_orders.create(lab_order)
