import { httpClient } from "../../auth/api/httpClient";
import type {
  NotificationApiResponse,
  NotificationListApiResponse,
  NotificationPreferencesApiResponse,
  UnreadCountApiResponse,
  UpdateNotificationPreferencesRequestBody,
} from "./notificationsApi.types";
import type {
  Notification,
  NotificationListParams,
  NotificationListResult,
  NotificationPreferences,
  NotificationSeverity,
  NotificationType,
  NotificationUnreadCountResult,
  UpdateNotificationPreferencesPayload,
} from "../types/notification.types";

const toNotification = (r: NotificationApiResponse): Notification => ({
  id: r.id,
  userId: r.user_id,
  title: r.title,
  message: r.message,
  notificationType: r.notification_type as NotificationType,
  severity: r.severity as NotificationSeverity,
  isRead: r.is_read,
  readAt: r.read_at,
  actionUrl: r.action_url,
  entityType: r.entity_type,
  entityId: r.entity_id,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const toPreferences = (r: NotificationPreferencesApiResponse): NotificationPreferences => ({
  id: r.id,
  userId: r.user_id,
  emailEnabled: r.email_enabled,
  pushEnabled: r.push_enabled,
  smsEnabled: r.sms_enabled,
  appointmentReminders: r.appointment_reminders,
  billingReminders: r.billing_reminders,
  labResults: r.lab_results,
  radiologyResults: r.radiology_results,
  lowStockAlerts: r.low_stock_alerts,
  systemAlerts: r.system_alerts,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const notificationsApi = {
  list: async (params: NotificationListParams): Promise<NotificationListResult> => {
    const query: Record<string, unknown> = {
      page: params.page ?? 1,
      page_size: params.pageSize ?? 20,
    };
    if (params.notificationType) query.notification_type = params.notificationType;
    if (params.isRead !== undefined) query.is_read = params.isRead;
    if (params.search?.trim()) query.search = params.search.trim();

    const { data } = await httpClient.get<NotificationListApiResponse>("/notifications", {
      params: query,
    });

    return {
      items: data.items.map(toNotification),
      total: data.total,
      page: data.page,
      pageSize: data.page_size,
      totalPages: data.total_pages,
    };
  },

  getUnreadCount: async (): Promise<NotificationUnreadCountResult> => {
    const { data } = await httpClient.get<UnreadCountApiResponse>("/notifications/unread-count");
    return { count: data.count };
  },

  markRead: async (id: string): Promise<Notification> => {
    const { data } = await httpClient.patch<NotificationApiResponse>(
      `/notifications/${id}/read`,
    );
    return toNotification(data);
  },

  markAllRead: async (): Promise<void> => {
    await httpClient.post("/notifications/mark-all-read");
  },

  delete: async (id: string): Promise<void> => {
    await httpClient.delete(`/notifications/${id}`);
  },

  getPreferences: async (): Promise<NotificationPreferences> => {
    const { data } = await httpClient.get<NotificationPreferencesApiResponse>(
      "/notifications/preferences",
    );
    return toPreferences(data);
  },

  updatePreferences: async (
    payload: UpdateNotificationPreferencesPayload,
  ): Promise<NotificationPreferences> => {
    const body: UpdateNotificationPreferencesRequestBody = {};
    if (payload.emailEnabled !== undefined) body.email_enabled = payload.emailEnabled;
    if (payload.pushEnabled !== undefined) body.push_enabled = payload.pushEnabled;
    if (payload.smsEnabled !== undefined) body.sms_enabled = payload.smsEnabled;
    if (payload.appointmentReminders !== undefined)
      body.appointment_reminders = payload.appointmentReminders;
    if (payload.billingReminders !== undefined) body.billing_reminders = payload.billingReminders;
    if (payload.labResults !== undefined) body.lab_results = payload.labResults;
    if (payload.radiologyResults !== undefined) body.radiology_results = payload.radiologyResults;
    if (payload.lowStockAlerts !== undefined) body.low_stock_alerts = payload.lowStockAlerts;
    if (payload.systemAlerts !== undefined) body.system_alerts = payload.systemAlerts;

    const { data } = await httpClient.patch<NotificationPreferencesApiResponse>(
      "/notifications/preferences",
      body,
    );
    return toPreferences(data);
  },
};
