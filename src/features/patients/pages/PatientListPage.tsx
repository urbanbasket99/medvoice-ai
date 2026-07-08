import { useState } from "react";
import { Box, Button, Stack } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useNavigate } from "react-router-dom";
import type { GridPaginationModel, GridSortModel } from "@mui/x-data-grid";

import { ErrorBanner, PageHeader } from "../../../components/ui";

import { useAuth } from "../../auth";
import PatientDeleteDialog from "../components/PatientDeleteDialog";
import PatientFilters, { EMPTY_PATIENT_FILTERS } from "../components/PatientFilters";
import type { PatientFiltersValue } from "../components/PatientFilters";
import PatientSearchBar from "../components/PatientSearchBar";
import PatientSnackbar from "../components/PatientSnackbar";
import PatientTable from "../components/PatientTable";
import { useConsumeFlashMessage } from "../hooks/useConsumeFlashMessage";
import { useDeletePatient } from "../hooks/useDeletePatient";
import { usePatientSearch, usePatients } from "../hooks/usePatients";
import { usePatientSnackbar } from "../hooks/usePatientSnackbar";
import type { Patient, PatientSortField } from "../types/patient.types";

const SORT_FIELD_MAP: Record<string, PatientSortField> = {
  mrn: "mrn",
  uhid: "uhid",
  fullName: "last_name",
  createdAt: "created_at",
};

const DEFAULT_SORT_MODEL: GridSortModel = [{ field: "createdAt", sort: "desc" }];

/**
 * Enterprise patient listing: server-side pagination + sorting (via
 * `PatientTable`), a debounced free-text search (against `/patients/search`,
 * which takes priority over the paginated list while active), and
 * status/gender/blood-group/city advanced filters (against `/patients`).
 * Column filtering and "manage columns" visibility come for free from the
 * grid's built-in per-column header menu.
 */
const PatientListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canCreate = Boolean(user?.isSuperuser || user?.permissions.includes("patients:create"));
  const canUpdate = Boolean(user?.isSuperuser || user?.permissions.includes("patients:update"));
  const canDelete = Boolean(user?.isSuperuser || user?.permissions.includes("patients:delete"));

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<PatientFiltersValue>(EMPTY_PATIENT_FILTERS);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const [sortModel, setSortModel] = useState<GridSortModel>(DEFAULT_SORT_MODEL);
  const [pendingDelete, setPendingDelete] = useState<Patient | null>(null);
  const { snackbar, showSuccess, showError, closeSnackbar } = usePatientSnackbar();

  useConsumeFlashMessage(showSuccess);

  const isSearching = searchQuery.trim().length > 0;
  const sortEntry = sortModel[0];
  const sortBy = (sortEntry && SORT_FIELD_MAP[sortEntry.field]) || "created_at";
  const sortDir = sortEntry?.sort === "asc" ? "asc" : "desc";

  const listQuery = usePatients({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    sortBy,
    sortDir,
    status: filters.status || undefined,
    gender: filters.gender || undefined,
    bloodGroup: filters.bloodGroup || undefined,
    city: filters.city || undefined,
  });

  const searchResult = usePatientSearch({
    query: searchQuery,
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
  });

  const activeQuery = isSearching ? searchResult : listQuery;
  const deletePatient = useDeletePatient();

  const rows = activeQuery.data?.items ?? [];
  const rowCount = activeQuery.data?.total ?? 0;

  const resetToFirstPage = () => setPaginationModel((prev) => ({ ...prev, page: 0 }));

  const handleConfirmDeactivate = async () => {
    if (!pendingDelete) return;
    try {
      await deletePatient.mutateAsync(pendingDelete.id);
      showSuccess(`${pendingDelete.fullName} was deactivated.`);
      setPendingDelete(null);
    } catch {
      showError(`Could not deactivate ${pendingDelete.fullName}. Please try again.`);
    }
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Patients"
        subtitle="Search, filter, and manage registered patients."
        actions={
          canCreate ? (
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate("/patients/new")}>
              Register Patient
            </Button>
          ) : undefined
        }
      />

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ alignItems: { md: "center" }, justifyContent: "space-between" }}
      >
        <Box sx={{ flex: 1, maxWidth: { md: 420 } }}>
          <PatientSearchBar
            value={searchQuery}
            onChange={(value) => {
              setSearchQuery(value);
              resetToFirstPage();
            }}
          />
        </Box>
        <PatientFilters
          value={filters}
          onChange={(value) => {
            setFilters(value);
            resetToFirstPage();
          }}
        />
      </Stack>

      {activeQuery.isError && (
        <ErrorBanner
          message="Failed to load patients. Please try again."
          onRetry={() => void activeQuery.refetch()}
        />
      )}

      <PatientTable
        rows={rows}
        rowCount={rowCount}
        loading={activeQuery.isFetching}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        sortModel={sortModel}
        onSortModelChange={(model) => setSortModel(model.length > 0 ? model : DEFAULT_SORT_MODEL)}
        onView={(patient) => navigate(`/patients/${patient.id}`)}
        onEdit={(patient) => navigate(`/patients/${patient.id}/edit`)}
        onDeactivate={(patient) => setPendingDelete(patient)}
        canUpdate={canUpdate}
        canDelete={canDelete}
      />

      <PatientDeleteDialog
        patient={pendingDelete}
        isDeleting={deletePatient.isPending}
        onConfirm={() => void handleConfirmDeactivate()}
        onClose={() => setPendingDelete(null)}
      />
      <PatientSnackbar state={snackbar} onClose={closeSnackbar} />
    </Stack>
  );
};

export default PatientListPage;
