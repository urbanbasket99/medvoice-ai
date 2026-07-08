// Pages
export { default as NotificationCenterPage } from "./pages/NotificationCenterPage";

// Components
export { default as NotificationBadge } from "./components/NotificationBadge";
export { default as NotificationBell } from "./components/NotificationBell";
export { default as NotificationCard } from "./components/NotificationCard";
export { default as NotificationDrawer } from "./components/NotificationDrawer";
export { default as NotificationToast } from "./components/NotificationToast";
export { default as NotificationPreferencesForm } from "./components/NotificationPreferencesForm";

// Context
export {
  NotificationToastProvider,
  useNotificationToast,
} from "./context/NotificationToastProvider";
export type { NotificationToastProviderProps } from "./context/NotificationToastProvider";

// Hooks
export { useNotifications } from "./hooks/useNotifications";
export { useUnreadCount } from "./hooks/useUnreadCount";
export {
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
} from "./hooks/useNotificationMutations";
export {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "./hooks/useNotificationPreferences";
export { useNotificationRealtime } from "./hooks/useNotificationRealtime";
export type { RealtimeNotificationProvider } from "./hooks/useNotificationRealtime";

// API
export { notificationsApi } from "./api/notificationsApi";

// Types
export type {
  Notification,
  NotificationType,
  NotificationSeverity,
  NotificationPreferences,
  NotificationListParams,
  NotificationListResult,
  NotificationUnreadCountResult,
  UpdateNotificationPreferencesPayload,
} from "./types/notification.types";

// Utils
export {
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_TYPE_ICONS,
  TYPE_PALETTE_COLORS,
  SEVERITY_PALETTE_COLORS,
  formatRelativeTime,
} from "./utils/notificationUtils";
