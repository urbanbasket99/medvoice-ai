from datetime import UTC, datetime
from uuid import UUID, uuid4

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.laboratory.application.dto.lab_order_dto import SendLabResultsEmailInput
from app.modules.laboratory.domain.entities.report_email_delivery import ReportEmailDelivery
from app.modules.laboratory.domain.exceptions import LabOrderNotFoundError
from app.modules.laboratory.domain.repositories.lab_order_repository import LabOrderRepository
from app.modules.laboratory.infrastructure.models.report_email_delivery_model import ReportEmailDeliveryModel


class SendLabResultsEmailUseCase:
    def __init__(
        self,
        lab_order_repository: LabOrderRepository,
        session: AsyncSession,
    ) -> None:
        self._lab_orders = lab_order_repository
        self._session = session

    async def execute(
        self,
        lab_order_id: UUID,
        data: SendLabResultsEmailInput,
        created_by: UUID | None = None,
    ) -> ReportEmailDelivery:
        lab_order = await self._lab_orders.get_by_id(lab_order_id)
        if lab_order is None:
            raise LabOrderNotFoundError("Lab order not found.")

        now = datetime.now(UTC)
        delivery_id = uuid4()
        subject = f"Lab Results - {lab_order.order_number}"

        # Simulated delivery — logs to DB; wire SMTP in production.
        model = ReportEmailDeliveryModel(
            id=delivery_id,
            resource_type="lab_results",
            resource_id=lab_order_id,
            recipient_email=data.recipient_email.strip().lower(),
            recipient_role=data.recipient_role,
            subject=subject,
            status="sent",
            sent_at=now,
            created_by=created_by,
        )
        self._session.add(model)
        await self._session.flush()

        return ReportEmailDelivery(
            id=delivery_id,
            resource_type="lab_results",
            resource_id=lab_order_id,
            recipient_email=data.recipient_email.strip().lower(),
            recipient_role=data.recipient_role,
            subject=subject,
            status="sent",
            created_at=now,
            sent_at=now,
            created_by=created_by,
        )
