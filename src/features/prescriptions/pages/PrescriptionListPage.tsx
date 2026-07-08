import { useState } from "react";
import { Box, Button, InputAdornment, Stack, TextField } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useNavigate } from "react-router-dom";
import type { GridPaginationModel, GridSortModel } from "@mui/x-data-grid";

import { ErrorBanner, PageHeader } from "../../../components/ui";

import { useAuth } from "../../auth";
import PrescriptionDeleteDialog from "../components/PrescriptionDeleteDialog";
import PrescriptionSnackbar from "../components/PrescriptionSnackbar";
import PrescriptionTable from "../components/PrescriptionTable";
import { useConsumeFlashMessage } from "../hooks/useConsumeFlashMessage";
import { useDeletePrescription } from "../hooks/useDeletePrescription";
import { usePrescriptionSearch, usePrescriptions } from "../hooks/usePrescriptions";
import { usePrescriptionSnackbar } from "../hooks/usePrescriptionSnackbar";
import type { Prescription, PrescriptionSortField } from "../types/prescription.types";

const SORT_FIELD_MAP: Record<string, PrescriptionSortField> = {
  createdAt: "created_at",
  updatedAt: "updated_at",
};

const DEFAULT_SORT_MODEL: GridSortModel = [{ field: "createdAt", sort: "desc" }];

const PrescriptionListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canCreate = Boolean(user?.isSuperuser || user?.permissions.includes("prescriptions:create"));
  const canUpdate = Boolean(user?.isSuperuser || user?.permissions.includes("prescriptions:update"));
  const canDelete = Boolean(user?.isSuperuser || user?.permissions.includes("prescriptions:delete"));

  const [searchQuery, setSearchQuery] = useState("");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const [sortModel, setSortModel] = useState<GridSortModel>(DEFAULT_SORT_MODEL);
  const [pendingDelete, setPendingDelete] = useState<Prescription | null>(null);
  const { snackbar, showSuccess, showError, closeSnackbar } = usePrescriptionSnackbar();

  useConsumeFlashMessage(showSuccess);

  const isSearching = searchQuery.trim().length > 0;
  const sortEntry = sortModel[0];
  const sortBy = (sortEntry && SORT_FIELD_MAP[sortEntry.field]) || "created_at";
  const sortDir = sortEntry?.sort === "asc" ? "asc" : "desc";

  const listQuery = usePrescriptions({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    sortBy,
    sortDir,
  });

  const searchResult = usePrescriptionSearch({
    query: searchQuery,
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
  });

  const activeQuery = isSearching ? searchResult : listQuery;
  const deletePrescription = useDeletePrescription();
  const rows = activeQuery.data?.items ?? [];
  const rowCount = activeQuery.data?.total ?? 0;

  const resetToFirstPage = () => setPaginationModel((prev) => ({ ...prev, page: 0 }));

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deletePrescription.mutateAsync(pendingDelete.id);
      showSuccess(`Prescription for ${pendingDelete.patientName ?? "patient"} was deleted.`);
      setPendingDelete(null);
    } catch {
      showError("Could not delete prescription. Please try again.");
    }
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Prescriptions"
        subtitle="Create, search, and manage patient prescriptions."
        actions={
          canCreate ? (
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate("/prescriptions/new")}>
              New Prescription
            </Button>
          ) : undefined
        }
      />

      <Box sx={{ maxWidth: { md: 420 } }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by patient, doctor, diagnosis, or visit number"
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
            resetToFirstPage();
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {activeQuery.isError && (
        <ErrorBanner
          message="Failed to load prescriptions. Please try again."
          onRetry={() => void activeQuery.refetch()}
        />
      )}

      <PrescriptionTable
        rows={rows}
        rowCount={rowCount}
        loading={activeQuery.isFetching}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        sortModel={sortModel}
        onSortModelChange={(model) => setSortModel(model.length > 0 ? model : DEFAULT_SORT_MODEL)}
        onView={(prescription) => navigate(`/prescriptions/${prescription.id}`)}
        onEdit={(prescription) => navigate(`/prescriptions/${prescription.id}/edit`)}
        onDelete={setPendingDelete}
        canUpdate={canUpdate}
        canDelete={canDelete}
      />

      <PrescriptionDeleteDialog
        prescription={pendingDelete}
        isDeleting={deletePrescription.isPending}
        onConfirm={() => void handleConfirmDelete()}
        onClose={() => setPendingDelete(null)}
      />
      <PrescriptionSnackbar state={snackbar} onClose={closeSnackbar} />
    </Stack>
  );
};

export default PrescriptionListPage;
