import { useState } from "react";
import { Box, Button, InputAdornment, Stack, TextField } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useNavigate } from "react-router-dom";
import type { GridPaginationModel, GridSortModel } from "@mui/x-data-grid";

import { ErrorBanner, PageHeader } from "../../../components/ui";

import { useAuth } from "../../auth";
import DispenseDeleteDialog from "../components/PharmacyDeleteDialog";
import DispenseTable from "../components/DispenseTable";
import PharmacySnackbar from "../components/PharmacySnackbar";
import { useConsumeFlashMessage } from "../hooks/useConsumeFlashMessage";
import { useDeleteDispense } from "../hooks/useDispenseMutations";
import { useDispenseSearch, useDispenses } from "../hooks/useDispenses";
import { usePharmacySnackbar } from "../hooks/usePharmacySnackbar";
import type { DispenseRecord, DispenseSortField } from "../types/pharmacy.types";

const SORT_FIELD_MAP: Record<string, DispenseSortField> = {
  orderNumber: "order_number",
  createdAt: "created_at",
  updatedAt: "updated_at",
};

const DEFAULT_SORT_MODEL: GridSortModel = [{ field: "createdAt", sort: "desc" }];

const DispenseListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canCreate = Boolean(user?.isSuperuser || user?.permissions.includes("pharmacy:create"));
  const canDelete = Boolean(user?.isSuperuser || user?.permissions.includes("pharmacy:delete"));

  const [searchQuery, setSearchQuery] = useState("");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const [sortModel, setSortModel] = useState<GridSortModel>(DEFAULT_SORT_MODEL);
  const [pendingDelete, setPendingDelete] = useState<DispenseRecord | null>(null);
  const { snackbar, showSuccess, showError, closeSnackbar } = usePharmacySnackbar();

  useConsumeFlashMessage(showSuccess);

  const isSearching = searchQuery.trim().length > 0;
  const sortEntry = sortModel[0];
  const sortBy = (sortEntry && SORT_FIELD_MAP[sortEntry.field]) || "created_at";
  const sortDir = sortEntry?.sort === "asc" ? "asc" : "desc";

  const listQuery = useDispenses({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    sortBy,
    sortDir,
  });

  const searchResult = useDispenseSearch({
    query: searchQuery,
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
  });

  const activeQuery = isSearching ? searchResult : listQuery;
  const deleteDispense = useDeleteDispense();
  const rows = activeQuery.data?.items ?? [];
  const rowCount = activeQuery.data?.total ?? 0;

  const resetToFirstPage = () => setPaginationModel((prev) => ({ ...prev, page: 0 }));

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteDispense.mutateAsync(pendingDelete.id);
      showSuccess(`Dispense ${pendingDelete.orderNumber} was deleted.`);
      setPendingDelete(null);
    } catch {
      showError("Could not delete dispense record. Please try again.");
    }
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Dispense Records"
        subtitle="Create, search, and manage pharmacy dispense records."
        actions={
          <>
            <Button variant="outlined" onClick={() => navigate("/pharmacy/suppliers")}>
              Suppliers
            </Button>
            <Button variant="outlined" onClick={() => navigate("/pharmacy/vendor-payments")}>
              Payments
            </Button>
            <Button variant="outlined" onClick={() => navigate("/pharmacy/inventory")}>
              Inventory
            </Button>
            {canCreate ? (
              <>
                <Button variant="outlined" onClick={() => navigate("/pharmacy/dispense/retail")}>
                  Retail billing
                </Button>
                <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate("/pharmacy/dispense/new")}>
                  New Dispense
                </Button>
              </>
            ) : null}
          </>
        }
      />

      <Box sx={{ maxWidth: { md: 420 } }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by order number, patient, doctor, or visit number"
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
          message="Failed to load dispense records. Please try again."
          onRetry={() => void activeQuery.refetch()}
        />
      )}

      <DispenseTable
        rows={rows}
        rowCount={rowCount}
        loading={activeQuery.isFetching}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        sortModel={sortModel}
        onSortModelChange={(model) => setSortModel(model.length > 0 ? model : DEFAULT_SORT_MODEL)}
        onView={(dispense) => navigate(`/pharmacy/dispense/${dispense.id}`)}
        onDelete={setPendingDelete}
        canDelete={canDelete}
      />

      <DispenseDeleteDialog
        dispense={pendingDelete}
        isDeleting={deleteDispense.isPending}
        onConfirm={() => void handleConfirmDelete()}
        onClose={() => setPendingDelete(null)}
      />
      <PharmacySnackbar state={snackbar} onClose={closeSnackbar} />
    </Stack>
  );
};

export default DispenseListPage;
