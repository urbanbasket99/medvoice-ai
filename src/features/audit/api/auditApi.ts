import { httpClient } from "../../auth/api/httpClient";
import type {
  AuditFilterOptionsApiResponse,
  AuditLogApiResponse,
  AuditLogListApiResponse,
} from "./auditApi.types";
import type {
  AuditFilterOptions,
  AuditLog,
  AuditLogListParams,
  AuditLogListResult,
} from "../types/audit.types";

const toAuditLog = (response: AuditLogApiResponse): AuditLog => ({
  id: response.id,
  timestamp: response.timestamp,
  userId: response.user_id,
  userName: response.user_name,
  role: response.role,
  module: response.module,
  entity: response.entity,
  entityId: response.entity_id,
  action: response.action,
  description: response.description,
  oldValue: response.old_value,
  newValue: response.new_value,
  ipAddress: response.ip_address,
  userAgent: response.user_agent,
  requestId: response.request_id,
});

const toListResult = (response: AuditLogListApiResponse): AuditLogListResult => ({
  items: response.items.map(toAuditLog),
  total: response.total,
  page: response.page,
  pageSize: response.page_size,
  totalPages: response.total_pages,
});

export const auditApi = {
  list: async (params: AuditLogListParams = {}): Promise<AuditLogListResult> => {
    const { data } = await httpClient.get<AuditLogListApiResponse>("/audit/logs", {
      params: {
        page: params.page,
        page_size: params.pageSize,
        sort_dir: params.sortDir,
        module: params.module || undefined,
        action: params.action || undefined,
        user_id: params.userId || undefined,
        entity: params.entity || undefined,
        entity_id: params.entityId || undefined,
        date_from: params.dateFrom || undefined,
        date_to: params.dateTo || undefined,
        q: params.search || undefined,
      },
    });
    return toListResult(data);
  },

  getById: async (id: string): Promise<AuditLog> => {
    const { data } = await httpClient.get<AuditLogApiResponse>(`/audit/logs/${id}`);
    return toAuditLog(data);
  },

  getFilterOptions: async (): Promise<AuditFilterOptions> => {
    const { data } = await httpClient.get<AuditFilterOptionsApiResponse>("/audit/logs/filters");
    return { modules: data.modules, actions: data.actions as AuditFilterOptions["actions"] };
  },

  exportCsv: async (params: AuditLogListParams = {}): Promise<Blob> => {
    const response = await httpClient.get<Blob>("/audit/logs/export", {
      params: {
        module: params.module || undefined,
        action: params.action || undefined,
        user_id: params.userId || undefined,
        entity: params.entity || undefined,
        entity_id: params.entityId || undefined,
        date_from: params.dateFrom || undefined,
        date_to: params.dateTo || undefined,
        q: params.search || undefined,
      },
      responseType: "blob",
    });
    return response.data;
  },
};
