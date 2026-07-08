from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, status

from app.modules.notifications.application.dto.notification_dto import (
    CreateNotificationInput,
    UpdatePreferencesInput,
)
from app.modules.notifications.domain.entities.notification import NotificationType
from app.modules.notifications.domain.value_objects import NotificationListCriteria, SortDirection
from app.modules.notifications.presentation.dependencies import (
    CreateNotificationUseCaseDep,
    DeleteNotificationUseCaseDep,
    GetNotificationUseCaseDep,
    GetPreferencesUseCaseDep,
    GetUnreadCountUseCaseDep,
    ListNotificationsUseCaseDep,
    MarkAllAsReadUseCaseDep,
    MarkAsReadUseCaseDep,
    RequireNotificationsCreate,
    RequireNotificationsDelete,
    RequireNotificationsRead,
    RequireNotificationsUpdate,
    UpdatePreferencesUseCaseDep,
)
from app.modules.notifications.presentation.schemas import (
    MarkAllReadResponse,
    NotificationCreateRequest,
    NotificationListResponse,
    NotificationPreferenceResponse,
    NotificationResponse,
    UnreadCountResponse,
    UpdatePreferencesRequest,
)

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=NotificationListResponse)
async def list_notifications(
    current_user: RequireNotificationsRead,
    use_case: ListNotificationsUseCaseDep,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=200)] = 20,
    sort_dir: SortDirection = SortDirection.DESC,
    notification_type: NotificationType | None = None,
    is_read: bool | None = None,
    q: Annotated[str | None, Query(max_length=200)] = None,
) -> NotificationListResponse:
    criteria = NotificationListCriteria(
        user_id=current_user.id,
        page=page,
        page_size=page_size,
        sort_dir=sort_dir,
        notification_type=notification_type,
        is_read=is_read,
        q=q,
    )
    result = await use_case.execute(criteria)
    return NotificationListResponse.from_page(result)


@router.get("/unread-count", response_model=UnreadCountResponse)
async def get_unread_count(
    current_user: RequireNotificationsRead,
    use_case: GetUnreadCountUseCaseDep,
) -> UnreadCountResponse:
    count = await use_case.execute(current_user.id)
    return UnreadCountResponse(count=count)


@router.get("/preferences", response_model=NotificationPreferenceResponse)
async def get_preferences(
    current_user: RequireNotificationsRead,
    use_case: GetPreferencesUseCaseDep,
) -> NotificationPreferenceResponse:
    prefs = await use_case.execute(current_user.id)
    return NotificationPreferenceResponse.from_entity(prefs)


@router.put("/preferences", response_model=NotificationPreferenceResponse)
async def update_preferences(
    payload: UpdatePreferencesRequest,
    current_user: RequireNotificationsUpdate,
    use_case: UpdatePreferencesUseCaseDep,
) -> NotificationPreferenceResponse:
    data = UpdatePreferencesInput(
        email_enabled=payload.email_enabled,
        push_enabled=payload.push_enabled,
        in_app_enabled=payload.in_app_enabled,
        type_preferences=payload.type_preferences,
    )
    prefs = await use_case.execute(current_user.id, data)
    return NotificationPreferenceResponse.from_entity(prefs)


@router.patch("/read-all", response_model=MarkAllReadResponse)
async def mark_all_as_read(
    current_user: RequireNotificationsUpdate,
    use_case: MarkAllAsReadUseCaseDep,
) -> MarkAllReadResponse:
    marked = await use_case.execute(current_user.id)
    return MarkAllReadResponse(marked=marked)


@router.get("/{notification_id}", response_model=NotificationResponse)
async def get_notification(
    notification_id: UUID,
    current_user: RequireNotificationsRead,
    use_case: GetNotificationUseCaseDep,
) -> NotificationResponse:
    notification = await use_case.execute(notification_id, current_user.id)
    return NotificationResponse.from_entity(notification)


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
async def mark_as_read(
    notification_id: UUID,
    current_user: RequireNotificationsUpdate,
    use_case: MarkAsReadUseCaseDep,
) -> NotificationResponse:
    notification = await use_case.execute(notification_id, current_user.id)
    return NotificationResponse.from_entity(notification)


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: UUID,
    current_user: RequireNotificationsDelete,
    use_case: DeleteNotificationUseCaseDep,
) -> None:
    await use_case.execute(notification_id, current_user.id)


@router.post("", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
async def create_notification(
    payload: NotificationCreateRequest,
    _: RequireNotificationsCreate,
    use_case: CreateNotificationUseCaseDep,
) -> NotificationResponse:
    data = CreateNotificationInput(
        user_id=payload.user_id,
        title=payload.title,
        message=payload.message,
        notification_type=payload.notification_type,
        severity=payload.severity,
        action_url=payload.action_url,
        entity_type=payload.entity_type,
        entity_id=payload.entity_id,
        metadata=payload.metadata,
    )
    notification = await use_case.execute(data)
    return NotificationResponse.from_entity(notification)
