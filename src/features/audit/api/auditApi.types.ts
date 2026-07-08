import type { AuditAction } from "../types/audit.types";

export interface AuditLogApiResponse {
  id: string;
  timestamp: string;
  user_id: string | null;
  user_name: string | null;
  role: string | null;
  module: string;
  entity: string;
  entity_id: string | null;
  action: AuditAction;
  description: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  request_id: string | null;
}

export interface AuditLogListApiResponse {
  items: AuditLogApiResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AuditFilterOptionsApiResponse {
  modules: string[];
  actions: string[];
}
