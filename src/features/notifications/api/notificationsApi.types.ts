export interface NotificationApiResponse {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: string;
  severity: string;
  is_read: boolean;
  read_at: string | null;
  action_url: string | null;
  entity_type: string | null;
  entity_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationListApiResponse {
  items: NotificationApiResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface UnreadCountApiResponse {
  count: number;
}

export interface NotificationPreferencesApiResponse {
  id: string;
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  appointment_reminders: boolean;
  billing_reminders: boolean;
  lab_results: boolean;
  radiology_results: boolean;
  low_stock_alerts: boolean;
  system_alerts: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateNotificationPreferencesRequestBody {
  email_enabled?: boolean;
  push_enabled?: boolean;
  sms_enabled?: boolean;
  appointment_reminders?: boolean;
  billing_reminders?: boolean;
  lab_results?: boolean;
  radiology_results?: boolean;
  low_stock_alerts?: boolean;
  system_alerts?: boolean;
}
