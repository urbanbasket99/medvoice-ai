from typing import Annotated

from fastapi import Depends

from app.api.deps import DbSession, require_permission
from app.domain.entities.user import User
from app.modules.notifications.application.use_cases.create_notification import (
    CreateNotificationUseCase,
)
from app.modules.notifications.application.use_cases.delete_notification import (
    DeleteNotificationUseCase,
)
from app.modules.notifications.application.use_cases.get_notification import GetNotificationUseCase
from app.modules.notifications.application.use_cases.get_preferences import GetPreferencesUseCase
from app.modules.notifications.application.use_cases.get_unread_count import GetUnreadCountUseCase
from app.modules.notifications.application.use_cases.list_notifications import (
    ListNotificationsUseCase,
)
from app.modules.notifications.application.use_cases.mark_all_as_read import MarkAllAsReadUseCase
from app.modules.notifications.application.use_cases.mark_as_read import MarkAsReadUseCase
from app.modules.notifications.application.use_cases.update_preferences import (
    UpdatePreferencesUseCase,
)
from app.modules.notifications.domain.repositories.notification_preference_repository import (
    NotificationPreferenceRepository,
)
from app.modules.notifications.domain.repositories.notification_repository import (
    NotificationRepository,
)
from app.modules.notifications.infrastructure.repositories.sqlalchemy_notification_preference_repository import (
    SqlAlchemyNotificationPreferenceRepository,
)
from app.modules.notifications.infrastructure.repositories.sqlalchemy_notification_repository import (
    SqlAlchemyNotificationRepository,
)


def get_notification_repository(db: DbSession) -> NotificationRepository:
    return SqlAlchemyNotificationRepository(db)


def get_notification_preference_repository(db: DbSession) -> NotificationPreferenceRepository:
    return SqlAlchemyNotificationPreferenceRepository(db)


NotificationRepositoryDep = Annotated[NotificationRepository, Depends(get_notification_repository)]
NotificationPreferenceRepositoryDep = Annotated[
    NotificationPreferenceRepository, Depends(get_notification_preference_repository)
]


def provide_list_notifications_use_case(
    repo: NotificationRepositoryDep,
) -> ListNotificationsUseCase:
    return ListNotificationsUseCase(repo)


def provide_get_unread_count_use_case(
    repo: NotificationRepositoryDep,
) -> GetUnreadCountUseCase:
    return GetUnreadCountUseCase(repo)


def provide_get_notification_use_case(
    repo: NotificationRepositoryDep,
) -> GetNotificationUseCase:
    return GetNotificationUseCase(repo)


def provide_mark_as_read_use_case(
    repo: NotificationRepositoryDep,
) -> MarkAsReadUseCase:
    return MarkAsReadUseCase(repo)


def provide_mark_all_as_read_use_case(
    repo: NotificationRepositoryDep,
) -> MarkAllAsReadUseCase:
    return MarkAllAsReadUseCase(repo)


def provide_delete_notification_use_case(
    repo: NotificationRepositoryDep,
) -> DeleteNotificationUseCase:
    return DeleteNotificationUseCase(repo)


def provide_get_preferences_use_case(
    repo: NotificationPreferenceRepositoryDep,
) -> GetPreferencesUseCase:
    return GetPreferencesUseCase(repo)


def provide_update_preferences_use_case(
    repo: NotificationPreferenceRepositoryDep,
) -> UpdatePreferencesUseCase:
    return UpdatePreferencesUseCase(repo)


def provide_create_notification_use_case(
    repo: NotificationRepositoryDep,
) -> CreateNotificationUseCase:
    return CreateNotificationUseCase(repo)


ListNotificationsUseCaseDep = Annotated[
    ListNotificationsUseCase, Depends(provide_list_notifications_use_case)
]
GetUnreadCountUseCaseDep = Annotated[
    GetUnreadCountUseCase, Depends(provide_get_unread_count_use_case)
]
GetNotificationUseCaseDep = Annotated[
    GetNotificationUseCase, Depends(provide_get_notification_use_case)
]
MarkAsReadUseCaseDep = Annotated[MarkAsReadUseCase, Depends(provide_mark_as_read_use_case)]
MarkAllAsReadUseCaseDep = Annotated[
    MarkAllAsReadUseCase, Depends(provide_mark_all_as_read_use_case)
]
DeleteNotificationUseCaseDep = Annotated[
    DeleteNotificationUseCase, Depends(provide_delete_notification_use_case)
]
GetPreferencesUseCaseDep = Annotated[
    GetPreferencesUseCase, Depends(provide_get_preferences_use_case)
]
UpdatePreferencesUseCaseDep = Annotated[
    UpdatePreferencesUseCase, Depends(provide_update_preferences_use_case)
]
CreateNotificationUseCaseDep = Annotated[
    CreateNotificationUseCase, Depends(provide_create_notification_use_case)
]

RequireNotificationsRead = Annotated[User, Depends(require_permission("notifications:read"))]
RequireNotificationsCreate = Annotated[User, Depends(require_permission("notifications:create"))]
RequireNotificationsUpdate = Annotated[User, Depends(require_permission("notifications:update"))]
RequireNotificationsDelete = Annotated[User, Depends(require_permission("notifications:delete"))]
