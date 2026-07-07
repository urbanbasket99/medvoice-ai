from datetime import UTC, datetime
from uuid import UUID, uuid4

from app.modules.radiology.application.dto.radiology_order_dto import (
    CreateRadiologyOrderInput,
    RadiologyOrderItemInput,
)
from app.modules.radiology.application.interfaces.consultation_lookup import ConsultationLookup
from app.modules.radiology.application.interfaces.radiology_order_number_generator import (
    RadiologyOrderNumberGenerator,
)
from app.modules.radiology.domain.entities.radiology_order import (
    RadiologyOrder,
    RadiologyOrderItem,
    RadiologyOrderStatusEvent,
)
from app.modules.radiology.domain.exceptions import RadiologyOrderConsultationNotFoundError
from app.modules.radiology.domain.repositories.radiology_order_repository import RadiologyOrderRepository
from app.modules.radiology.domain.value_objects import RadiologyStatus


def _build_items(
    radiology_order_id: UUID, items: tuple[RadiologyOrderItemInput, ...]
) -> list[RadiologyOrderItem]:
    built: list[RadiologyOrderItem] = []
    for index, item in enumerate(items):
        built.append(
            RadiologyOrderItem(
                id=uuid4(),
                radiology_order_id=radiology_order_id,
                radiology_test_master_id=item.radiology_test_master_id,
                test_name=item.test_name,
                category=item.category,
                body_part=item.body_part,
                contrast_required=item.contrast_required,
                instructions=item.instructions,
                sort_order=item.sort_order if item.sort_order else index,
            )
        )
    return built


class CreateRadiologyOrderUseCase:
    def __init__(
        self,
        radiology_order_repository: RadiologyOrderRepository,
        consultation_lookup: ConsultationLookup,
        order_number_generator: RadiologyOrderNumberGenerator,
    ) -> None:
        self._radiology_orders = radiology_order_repository
        self._consultations = consultation_lookup
        self._order_numbers = order_number_generator

    async def execute(self, data: CreateRadiologyOrderInput) -> RadiologyOrder:
        context = await self._consultations.get_consultation_context(data.consultation_id)
        if context is None:
            raise RadiologyOrderConsultationNotFoundError("The selected consultation does not exist.")

        now = datetime.now(UTC)
        radiology_order_id = uuid4()
        order_number = await self._order_numbers.generate()
        initial_status = RadiologyStatus.ORDERED

        radiology_order = RadiologyOrder(
            id=radiology_order_id,
            consultation_id=context.consultation_id,
            patient_id=context.patient_id,
            doctor_id=context.doctor_id,
            order_number=order_number,
            priority=data.priority,
            clinical_notes=data.clinical_notes,
            status=initial_status,
            created_at=now,
            updated_at=now,
            items=_build_items(radiology_order_id, data.items),
            status_history=[
                RadiologyOrderStatusEvent(
                    id=uuid4(),
                    radiology_order_id=radiology_order_id,
                    status=initial_status,
                    notes="Radiology order created.",
                    changed_at=now,
                )
            ],
        )
        return await self._radiology_orders.create(radiology_order)
