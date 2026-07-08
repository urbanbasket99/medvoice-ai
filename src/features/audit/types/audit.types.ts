export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "view"
  | "print"
  | "export"
  | "login"
  | "logout"
  | "payment"
  | "prescription_print"
  | "lab_order"
  | "radiology_order"
  | "notification_sent";

export type AuditSortField = "timestamp";
export type SortDirection = "asc" | "desc";

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string | null;
  userName: string | null;
  role: string | null;
  module: string;
  entity: string;
  entityId: string | null;
  action: AuditAction;
  description: string;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  requestId: string | null;
}

export interface AuditLogListParams {
  page?: number;
  pageSize?: number;
  sortDir?: SortDirection;
  module?: string;
  action?: AuditAction;
  userId?: string;
  entity?: string;
  entityId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface AuditLogListResult {
  items: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AuditFilterOptions {
  modules: string[];
  actions: string[];
}

export interface AuditFiltersValue {
  module: string;
  action: AuditAction | "";
  userName: string;
  dateFrom: string;
  dateTo: string;
}
