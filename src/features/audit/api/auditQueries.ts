import { queryOptions } from "@tanstack/react-query";

import { auditApi } from "./auditApi";
import type { AuditLogListParams } from "../types/audit.types";

export const auditQueryKeys = {
  all: ["audit"] as const,
  lists: () => [...auditQueryKeys.all, "list"] as const,
  list: (params: AuditLogListParams) => [...auditQueryKeys.lists(), params] as const,
  details: () => [...auditQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...auditQueryKeys.details(), id] as const,
  filters: () => [...auditQueryKeys.all, "filters"] as const,
};

export const auditLogsQueryOptions = (params: AuditLogListParams) =>
  queryOptions({
    queryKey: auditQueryKeys.list(params),
    queryFn: () => auditApi.list(params),
  });

export const auditLogDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: auditQueryKeys.detail(id),
    queryFn: () => auditApi.getById(id),
    enabled: Boolean(id),
  });

export const auditFilterOptionsQueryOptions = () =>
  queryOptions({
    queryKey: auditQueryKeys.filters(),
    queryFn: () => auditApi.getFilterOptions(),
  });
