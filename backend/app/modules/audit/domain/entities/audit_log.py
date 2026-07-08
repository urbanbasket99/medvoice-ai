"""Audit log aggregate root."""

from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from uuid import UUID


class AuditAction(str, Enum):
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    VIEW = "view"
    PRINT = "print"
    EXPORT = "export"
    LOGIN = "login"
    LOGOUT = "logout"
    PAYMENT = "payment"
    PRESCRIPTION_PRINT = "prescription_print"
    LAB_ORDER = "lab_order"
    RADIOLOGY_ORDER = "radiology_order"
    NOTIFICATION_SENT = "notification_sent"


@dataclass(slots=True)
class AuditLog:
    id: UUID
    timestamp: datetime
    user_id: UUID | None
    user_name: str | None
    role: str | None
    module: str
    entity: str
    entity_id: UUID | None
    action: AuditAction
    description: str
    old_value: dict | None
    new_value: dict | None
    ip_address: str | None
    user_agent: str | None
    request_id: str | None
