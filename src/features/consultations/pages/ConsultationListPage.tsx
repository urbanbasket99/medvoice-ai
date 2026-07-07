import { useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useNavigate } from "react-router-dom";
import type { GridPaginationModel, GridSortModel } from "@mui/x-data-grid";

import { useAuth } from "../../auth";
import ConsultationDeleteDialog from "../components/ConsultationDeleteDialog";
import ConsultationFilters, { EMPTY_CONSULTATION_FILTERS } from "../components/ConsultationFilters";
import type { ConsultationFiltersValue } from "../components/ConsultationFilters";
import ConsultationSearchBar from "../components/ConsultationSearchBar";
import ConsultationSnackbar from "../components/ConsultationSnackbar";
import ConsultationTable from "../components/ConsultationTable";
import { useConsumeFlashMessage } from "../hooks/useConsumeFlashMessage";
import { useDeleteConsultation } from "../hooks/useDeleteConsultation";
import { useConsultationSearch, useConsultations } from "../hooks/useConsultations";
import { useConsultationSnackbar } from "../hooks/useConsultationSnackbar";
import type { Consultation, ConsultationSortField } from "../types/consultation.types";

const SORT_FIELD_MAP: Record<string, ConsultationSortField> = {
  visitNumber: "visit_number",
  status: "status",
  createdAt: "created_at",
};

const DEFAULT_SORT_MODEL: GridSortModel = [{ field: "createdAt", sort: "desc" }];

const ConsultationListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canCreate = Boolean(user?.isSuperuser || user?.permissions.includes("consultations:create"));
  const canUpdate = Boolean(user?.isSuperuser || user?.permissions.includes("consultations:update"));
  const canDelete = Boolean(user?.isSuperuser || user?.permissions.includes("consultations:delete"));

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<ConsultationFiltersValue>(EMPTY_CONSULTATION_FILTERS);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const [sortModel, setSortModel] = useState<GridSortModel>(DEFAULT_SORT_MODEL);
  const [pendingDelete, setPendingDelete] = useState<Consultation | null>(null);
  const { snackbar, showSuccess, showError, closeSnackbar } = useConsultationSnackbar();

  useConsumeFlashMessage(showSuccess);

  const isSearching = searchQuery.trim().length > 0;
  const sortEntry = sortModel[0];
  const sortBy = (sortEntry && SORT_FIELD_MAP[sortEntry.field]) || "created_at";
  const sortDir = sortEntry?.sort === "asc" ? "asc" : "desc";

  const listQuery = useConsultations({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    sortBy,
    sortDir,
    status: filters.status || undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
  });

  const searchResult = useConsultationSearch({
    query: searchQuery,
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
  });

  const activeQuery = isSearching ? searchResult : listQuery;
  const deleteConsultation = useDeleteConsultation();
  const rows = activeQuery.data?.items ?? [];
  const rowCount = activeQuery.data?.total ?? 0;

  const resetToFirstPage = () => setPaginationModel((prev) => ({ ...prev, page: 0 }));

  const handleConfirmCancel = async () => {
    if (!pendingDelete) return;
    try {
      await deleteConsultation.mutateAsync(pendingDelete.id);
      showSuccess(`Consultation ${pendingDelete.visitNumber} was cancelled.`);
      setPendingDelete(null);
    } catch {
      showError(`Could not cancel consultation ${pendingDelete.visitNumber}. Please try again.`);
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Consultations
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Open, document, and complete patient consultations.
          </Typography>
        </Box>
        {canCreate && (
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate("/consultations/new")}>
            Start Consultation
          </Button>
        )}
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ alignItems: { md: "center" }, justifyContent: "space-between" }}>
        <Box sx={{ flex: 1, maxWidth: { md: 420 } }}>
          <ConsultationSearchBar
            value={searchQuery}
            onChange={(value) => {
              setSearchQuery(value);
              resetToFirstPage();
            }}
          />
        </Box>
        <ConsultationFilters
          value={filters}
          onChange={(value) => {
            setFilters(value);
            resetToFirstPage();
          }}
        />
      </Stack>

      <ConsultationTable
        rows={rows}
        rowCount={rowCount}
        loading={activeQuery.isFetching}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        sortModel={sortModel}
        onSortModelChange={setSortModel}
        onView={(consultation) => navigate(`/consultations/${consultation.id}`)}
        onEdit={(consultation) => navigate(`/consultations/${consultation.id}/edit`)}
        onCancel={setPendingDelete}
        canUpdate={canUpdate}
        canDelete={canDelete}
      />

      <ConsultationDeleteDialog
        consultation={pendingDelete}
        isDeleting={deleteConsultation.isPending}
        onConfirm={() => void handleConfirmCancel()}
        onClose={() => setPendingDelete(null)}
      />
      <ConsultationSnackbar state={snackbar} onClose={closeSnackbar} />
    </Stack>
  );
};

export default ConsultationListPage;
