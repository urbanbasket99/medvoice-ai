import { useQuery } from "@tanstack/react-query";

import { auditLogsQueryOptions, auditLogDetailQueryOptions } from "../api/auditQueries";
import type { AuditLogListParams } from "../types/audit.types";

export const useAuditLogs = (params: AuditLogListParams) =>
  useQuery({
    ...auditLogsQueryOptions(params),
    placeholderData: (previous) => previous,
  });

export const useAuditLog = (id: string) => useQuery(auditLogDetailQueryOptions(id));
