import { useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useNavigate } from "react-router-dom";
import type { GridPaginationModel, GridSortModel } from "@mui/x-data-grid";

import { useAuth } from "../../auth";
import DoctorDeleteDialog from "../components/DoctorDeleteDialog";
import DoctorFilters, { EMPTY_DOCTOR_FILTERS } from "../components/DoctorFilters";
import type { DoctorFiltersValue } from "../components/DoctorFilters";
import DoctorSearchBar from "../components/DoctorSearchBar";
import DoctorSnackbar from "../components/DoctorSnackbar";
import DoctorTable from "../components/DoctorTable";
import { useConsumeFlashMessage } from "../hooks/useConsumeFlashMessage";
import { useDeleteDoctor } from "../hooks/useDeleteDoctor";
import { useDoctorSearch, useDoctors } from "../hooks/useDoctors";
import { useDoctorSnackbar } from "../hooks/useDoctorSnackbar";
import type { Doctor, DoctorSortField } from "../types/doctor.types";

const SORT_FIELD_MAP: Record<string, DoctorSortField> = {
  doctorCode: "doctor_code",
  fullName: "full_name",
  department: "department",
  experienceYears: "experience_years",
  joiningDate: "joining_date",
  createdAt: "created_at",
};

const DEFAULT_SORT_MODEL: GridSortModel = [{ field: "createdAt", sort: "desc" }];

const DoctorListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canCreate = Boolean(user?.isSuperuser || user?.permissions.includes("doctors:create"));
  const canUpdate = Boolean(user?.isSuperuser || user?.permissions.includes("doctors:update"));
  const canDelete = Boolean(user?.isSuperuser || user?.permissions.includes("doctors:delete"));

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<DoctorFiltersValue>(EMPTY_DOCTOR_FILTERS);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const [sortModel, setSortModel] = useState<GridSortModel>(DEFAULT_SORT_MODEL);
  const [pendingDelete, setPendingDelete] = useState<Doctor | null>(null);
  const { snackbar, showSuccess, showError, closeSnackbar } = useDoctorSnackbar();

  useConsumeFlashMessage(showSuccess);

  const isSearching = searchQuery.trim().length > 0;
  const sortEntry = sortModel[0];
  const sortBy = (sortEntry && SORT_FIELD_MAP[sortEntry.field]) || "created_at";
  const sortDir = sortEntry?.sort === "asc" ? "asc" : "desc";

  const listQuery = useDoctors({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    sortBy,
    sortDir,
    status: filters.status || undefined,
    department: filters.department || undefined,
    gender: filters.gender || undefined,
    specialization: filters.specialization || undefined,
  });

  const searchResult = useDoctorSearch({
    query: searchQuery,
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
  });

  const activeQuery = isSearching ? searchResult : listQuery;
  const deleteDoctor = useDeleteDoctor();

  const rows = activeQuery.data?.items ?? [];
  const rowCount = activeQuery.data?.total ?? 0;

  const resetToFirstPage = () => setPaginationModel((prev) => ({ ...prev, page: 0 }));

  const handleConfirmDeactivate = async () => {
    if (!pendingDelete) return;
    try {
      await deleteDoctor.mutateAsync(pendingDelete.id);
      showSuccess(`${pendingDelete.fullName} was deactivated.`);
      setPendingDelete(null);
    } catch {
      showError(`Could not deactivate ${pendingDelete.fullName}. Please try again.`);
    }
  };

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Doctors
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Search, filter, and manage registered doctors.
          </Typography>
        </Box>
        {canCreate && (
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate("/doctors/new")}>
            Register Doctor
          </Button>
        )}
      </Stack>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ alignItems: { md: "center" }, justifyContent: "space-between" }}
      >
        <Box sx={{ flex: 1, maxWidth: { md: 420 } }}>
          <DoctorSearchBar
            value={searchQuery}
            onChange={(value) => {
              setSearchQuery(value);
              resetToFirstPage();
            }}
          />
        </Box>
        <DoctorFilters
          value={filters}
          onChange={(value) => {
            setFilters(value);
            resetToFirstPage();
          }}
        />
      </Stack>

      {activeQuery.isError && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            px: 2,
            py: 1,
            borderRadius: 1,
            bgcolor: "error.light",
            color: "error.dark",
          }}
        >
          <Typography variant="body2">Failed to load doctors. Please try again.</Typography>
          <Button size="small" color="error" onClick={() => void activeQuery.refetch()}>
            Retry
          </Button>
        </Box>
      )}

      <DoctorTable
        rows={rows}
        rowCount={rowCount}
        loading={activeQuery.isFetching}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        sortModel={sortModel}
        onSortModelChange={(model) => setSortModel(model.length > 0 ? model : DEFAULT_SORT_MODEL)}
        onView={(doctor) => navigate(`/doctors/${doctor.id}`)}
        onEdit={(doctor) => navigate(`/doctors/${doctor.id}/edit`)}
        onDeactivate={(doctor) => setPendingDelete(doctor)}
        canUpdate={canUpdate}
        canDelete={canDelete}
      />

      <DoctorDeleteDialog
        doctor={pendingDelete}
        isDeleting={deleteDoctor.isPending}
        onConfirm={() => void handleConfirmDeactivate()}
        onClose={() => setPendingDelete(null)}
      />
      <DoctorSnackbar state={snackbar} onClose={closeSnackbar} />
    </Stack>
  );
};

export default DoctorListPage;
