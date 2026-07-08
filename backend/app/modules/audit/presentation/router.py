import csv
import io
from datetime import datetime
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse

from app.modules.audit.domain.entities.audit_log import AuditAction
from app.modules.audit.domain.value_objects import AuditLogListCriteria, SortDirection
from app.modules.audit.presentation.dependencies import (
    ExportAuditLogsUseCaseDep,
    GetAuditLogUseCaseDep,
    ListAuditLogsUseCaseDep,
    RequireAuditRead,
)
from app.modules.audit.presentation.schemas import (
    AuditFilterOptionsResponse,
    AuditLogListResponse,
    AuditLogResponse,
)

router = APIRouter(prefix="/audit/logs", tags=["audit"])


@router.get("", response_model=AuditLogListResponse)
async def list_audit_logs(
    _: RequireAuditRead,
    use_case: ListAuditLogsUseCaseDep,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=200)] = 20,
    sort_dir: SortDirection = SortDirection.DESC,
    module: Annotated[str | None, Query(max_length=50)] = None,
    action: AuditAction | None = None,
    user_id: UUID | None = None,
    entity: Annotated[str | None, Query(max_length=100)] = None,
    entity_id: UUID | None = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    q: Annotated[str | None, Query(max_length=200)] = None,
) -> AuditLogListResponse:
    criteria = AuditLogListCriteria(
        page=page,
        page_size=page_size,
        sort_dir=sort_dir,
        module=module,
        action=action,
        user_id=user_id,
        entity=entity,
        entity_id=entity_id,
        date_from=date_from,
        date_to=date_to,
        q=q,
    )
    result = await use_case.execute(criteria)
    return AuditLogListResponse.from_page(result)


@router.get("/filters", response_model=AuditFilterOptionsResponse)
async def get_audit_filter_options(_: RequireAuditRead) -> AuditFilterOptionsResponse:
    return AuditFilterOptionsResponse(
        modules=sorted(
            {
                "auth",
                "patients",
                "doctors",
                "appointments",
                "consultations",
                "prescriptions",
                "laboratory",
                "radiology",
                "pharmacy",
                "billing",
                "notifications",
                "voice",
                "transcriptions",
                "ai",
                "audit",
            }
        ),
        actions=[action.value for action in AuditAction],
    )


@router.get("/export")
async def export_audit_logs_csv(
    _: RequireAuditRead,
    use_case: ExportAuditLogsUseCaseDep,
    module: Annotated[str | None, Query(max_length=50)] = None,
    action: AuditAction | None = None,
    user_id: UUID | None = None,
    entity: Annotated[str | None, Query(max_length=100)] = None,
    entity_id: UUID | None = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    q: Annotated[str | None, Query(max_length=200)] = None,
) -> StreamingResponse:
    criteria = AuditLogListCriteria(
        module=module,
        action=action,
        user_id=user_id,
        entity=entity,
        entity_id=entity_id,
        date_from=date_from,
        date_to=date_to,
        q=q,
    )
    rows = await use_case.execute(criteria)

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(
        [
            "ID",
            "Timestamp",
            "User ID",
            "User Name",
            "Role",
            "Module",
            "Entity",
            "Entity ID",
            "Action",
            "Description",
            "IP Address",
            "User Agent",
            "Request ID",
        ]
    )
    for row in rows:
        writer.writerow(
            [
                str(row.id),
                row.timestamp.isoformat(),
                str(row.user_id) if row.user_id else "",
                row.user_name or "",
                row.role or "",
                row.module,
                row.entity,
                str(row.entity_id) if row.entity_id else "",
                row.action.value,
                row.description,
                row.ip_address or "",
                row.user_agent or "",
                row.request_id or "",
            ]
        )

    buffer.seek(0)
    filename = f"audit-logs-{datetime.now().strftime('%Y%m%d-%H%M%S')}.csv"
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/{audit_log_id}", response_model=AuditLogResponse)
async def get_audit_log(
    audit_log_id: UUID,
    _: RequireAuditRead,
    use_case: GetAuditLogUseCaseDep,
) -> AuditLogResponse:
    audit_log = await use_case.execute(audit_log_id)
    return AuditLogResponse.from_entity(audit_log)
