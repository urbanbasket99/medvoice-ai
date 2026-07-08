import { useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import type { GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import ErrorBanner from "../../../components/ui/ErrorBanner";
import PageHeader from "../../../components/ui/PageHeader";
import AuditFilters, { EMPTY_AUDIT_FILTERS } from "../components/AuditFilters";
import AuditTable from "../components/AuditTable";
import { auditApi } from "../api/auditApi";
import { auditFilterOptionsQueryOptions } from "../api/auditQueries";
import { useAuditLogs } from "../hooks/useAuditLogs";
import type { AuditAction, AuditFiltersValue } from "../types/audit.types";
import { downloadBlob } from "../utils/auditUtils";

const DEFAULT_SORT_MODEL: GridSortModel = [{ field: "timestamp", sort: "desc" }];

const AuditLogListPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<AuditFiltersValue>(EMPTY_AUDIT_FILTERS);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>(DEFAULT_SORT_MODEL);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const filterOptionsQuery = useQuery(auditFilterOptionsQueryOptions());

  const sortEntry = sortModel[0];
  const sortDir = sortEntry?.sort === "asc" ? "asc" : "desc";

  const listParams = useMemo(
    () => ({
      page: paginationModel.page + 1,
      pageSize: paginationModel.pageSize,
      sortDir: sortDir as "asc" | "desc",
      module: filters.module || undefined,
      action: (filters.action || undefined) as AuditAction | undefined,
      dateFrom: filters.dateFrom ? `${filters.dateFrom}T00:00:00` : undefined,
      dateTo: filters.dateTo ? `${filters.dateTo}T23:59:59` : undefined,
      search: [searchQuery.trim(), filters.userName.trim()].filter(Boolean).join(" ") || undefined,
    }),
    [paginationModel, sortDir, filters, searchQuery],
  );

  const { data, isFetching, isError, refetch } = useAuditLogs(listParams);

  const handleExportCsv = async () => {
    setExportError(null);
    setExporting(true);
    try {
      const blob = await auditApi.exportCsv(listParams);
      downloadBlob(blob, `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`);
    } catch {
      setExportError("Could not export audit logs. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const moduleOptions = filterOptionsQuery.data?.modules ?? [];
  const actionOptions = (filterOptionsQuery.data?.actions ?? []) as AuditAction[];

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Audit Logs"
        subtitle="Enterprise compliance trail for all system actions."
        actions={
          <Button
            variant="outlined"
            startIcon={exporting ? <CircularProgress size={16} /> : <FileDownloadRoundedIcon />}
            onClick={() => void handleExportCsv()}
            disabled={exporting}
          >
            Export CSV
          </Button>
        }
      />

      {exportError && <ErrorBanner message={exportError} />}

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ alignItems: { md: "center" } }}
      >
        <TextField
          size="small"
          placeholder="Search description, user, module, request ID…"
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
            setPaginationModel((prev) => ({ ...prev, page: 0 }));
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ minWidth: { md: 320 }, flexGrow: 1 }}
        />

        <AuditFilters
          value={filters}
          onChange={(next) => {
            setFilters(next);
            setPaginationModel((prev) => ({ ...prev, page: 0 }));
          }}
          moduleOptions={moduleOptions}
          actionOptions={actionOptions}
        />
      </Stack>

      {isError && (
        <ErrorBanner message="Could not load audit logs." onRetry={() => void refetch()} />
      )}

      <AuditTable
        rows={data?.items ?? []}
        rowCount={data?.total ?? 0}
        loading={isFetching}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        sortModel={sortModel}
        onSortModelChange={setSortModel}
        onView={(log) => navigate(`/audit/logs/${log.id}`)}
      />
    </Stack>
  );
};

export default AuditLogListPage;
