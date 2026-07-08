import re
from uuid import UUID

from app.modules.audit.domain.entities.audit_log import AuditAction

_UUID_PATTERN = re.compile(
    r"[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"
)

_MODULE_ALIASES: dict[str, str] = {
    "auth": "auth",
    "patients": "patients",
    "doctors": "doctors",
    "appointments": "appointments",
    "consultations": "consultations",
    "voice": "voice",
    "ai": "ai",
    "transcriptions": "transcriptions",
    "prescriptions": "prescriptions",
    "medicines": "prescriptions",
    "laboratory": "laboratory",
    "radiology": "radiology",
    "pharmacy": "pharmacy",
    "billing": "billing",
    "notifications": "notifications",
    "audit": "audit",
}

_ENTITY_ALIASES: dict[str, str] = {
    "patients": "Patient",
    "doctors": "Doctor",
    "appointments": "Appointment",
    "consultations": "Consultation",
    "voice": "VoiceRecording",
    "ai": "AIProvider",
    "transcriptions": "Transcription",
    "prescriptions": "Prescription",
    "medicines": "Medicine",
    "laboratory": "LabOrder",
    "radiology": "RadiologyOrder",
    "pharmacy": "PharmacyRecord",
    "billing": "Invoice",
    "notifications": "Notification",
    "audit": "AuditLog",
    "auth": "User",
    "payments": "Payment",
    "invoices": "Invoice",
    "dispenses": "Dispense",
    "orders": "Order",
}


def extract_entity_id(path: str) -> UUID | None:
    match = _UUID_PATTERN.search(path)
    if not match:
        return None
    try:
        return UUID(match.group(0))
    except ValueError:
        return None


def infer_module_and_entity(path: str) -> tuple[str, str]:
    segments = [segment for segment in path.strip("/").split("/") if segment]
    if not segments:
        return "system", "Resource"

    if segments[0] == "api" and len(segments) > 1:
        segments = segments[1:]
    if segments[0] == "v1":
        segments = segments[1:]

    if not segments:
        return "system", "Resource"

    module_key = segments[0]
    module = _MODULE_ALIASES.get(module_key, module_key)

    entity_key = segments[1] if len(segments) > 1 and not _UUID_PATTERN.fullmatch(segments[1]) else module_key
    entity = _ENTITY_ALIASES.get(entity_key, entity_key.replace("-", " ").title().replace(" ", ""))

    return module, entity


def infer_action(method: str, path: str) -> AuditAction:
    normalized_path = path.lower()
    method = method.upper()

    if normalized_path.endswith("/auth/login") and method == "POST":
        return AuditAction.LOGIN
    if normalized_path.endswith("/auth/logout") and method == "POST":
        return AuditAction.LOGOUT
    if "print" in normalized_path:
        if "prescription" in normalized_path:
            return AuditAction.PRESCRIPTION_PRINT
        return AuditAction.PRINT
    if "export" in normalized_path:
        return AuditAction.EXPORT
    if "/payments" in normalized_path and method == "POST":
        return AuditAction.PAYMENT
    if "/notifications" in normalized_path and method == "POST":
        return AuditAction.NOTIFICATION_SENT
    if "/laboratory/orders" in normalized_path and method == "POST":
        return AuditAction.LAB_ORDER
    if "/radiology/orders" in normalized_path and method == "POST":
        return AuditAction.RADIOLOGY_ORDER

    if method == "POST":
        return AuditAction.CREATE
    if method in {"PUT", "PATCH"}:
        return AuditAction.UPDATE
    if method == "DELETE":
        return AuditAction.DELETE
    return AuditAction.VIEW


def build_description(method: str, path: str, action: AuditAction, status_code: int) -> str:
    module, entity = infer_module_and_entity(path)
    return f"{action.value.replace('_', ' ').title()} {entity} via {method} {path} (HTTP {status_code}) in {module} module"
