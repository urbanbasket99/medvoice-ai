from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass(slots=True)
class ReportEmailDelivery:
    id: UUID
    resource_type: str
    resource_id: UUID
    recipient_email: str
    subject: str
    status: str
    created_at: datetime
    recipient_role: str | None = None
    error_message: str | None = None
    sent_at: datetime | None = None
    created_by: UUID | None = None
