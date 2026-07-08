export type NotificationType =
  | "success"
  | "error"
  | "warning"
  | "information"
  | "appointment_reminder"
  | "billing_reminder"
  | "lab_result"
  | "radiology_result"
  | "low_stock"
  | "system_alert";

export type NotificationSeverity = "low" | "medium" | "high" | "critical";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  notificationType: NotificationType;
  severity: NotificationSeverity;
  isRead: boolean;
  readAt: string | null;
  actionUrl: string | null;
  entityType: string | null;
  entityId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListParams {
  page?: number;
  pageSize?: number;
  notificationType?: NotificationType;
  isRead?: boolean;
  search?: string;
}

export interface NotificationListResult {
  items: Notification[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface NotificationUnreadCountResult {
  count: number;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  appointmentReminders: boolean;
  billingReminders: boolean;
  labResults: boolean;
  radiologyResults: boolean;
  lowStockAlerts: boolean;
  systemAlerts: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateNotificationPreferencesPayload {
  emailEnabled?: boolean;
  pushEnabled?: boolean;
  smsEnabled?: boolean;
  appointmentReminders?: boolean;
  billingReminders?: boolean;
  labResults?: boolean;
  radiologyResults?: boolean;
  lowStockAlerts?: boolean;
  systemAlerts?: boolean;
}
