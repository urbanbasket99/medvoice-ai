import { useMemo, useState } from "react";
import { Box, Button, Chip, Stack } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { DataGrid, type GridColDef, type GridPaginationModel } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { ErrorBanner, PageHeader } from "../../../components/ui";
import { useAuth } from "../../auth";
import { admissionsListQueryOptions } from "../api/ipdQueries";
import type { Admission, AdmissionStatus } from "../types/ipd.types";

const STATUS_LABEL: Record<AdmissionStatus, string> = {
  admitted: "Admitted",
  discharged: "Discharged",
  cancelled: "Cancelled",
};

const STATUS_COLOR: Record<AdmissionStatus, "default" | "success" | "warning"> = {
  admitted: "success",
  discharged: "default",
  cancelled: "warning",
};

const AdmissionListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canCreate = Boolean(user?.isSuperuser || user?.permissions.includes("ipd:create"));
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const [activeOnly, setActiveOnly] = useState(true);

  const listQuery = useQuery(
    admissionsListQueryOptions({
      page: paginationModel.page + 1,
      pageSize: paginationModel.pageSize,
      status: activeOnly ? "admitted" : undefined,
    })
  );

  const columns = useMemo<GridColDef<Admission>[]>(
    () => [
      { field: "admissionNumber", headerName: "Admission #", width: 130 },
      {
        field: "patientName",
        headerName: "Patient",
        flex: 1.2,
        minWidth: 180,
        valueGetter: (_, row) => row.patientName ?? row.patientMrn ?? row.patientId,
      },
      {
        field: "doctorName",
        headerName: "Doctor",
        flex: 1,
        minWidth: 140,
        valueGetter: (_, row) => row.doctorName ?? row.doctorCode ?? row.admittingDoctorId,
      },
      { field: "wardName", headerName: "Ward", flex: 0.8, minWidth: 120, valueGetter: (_, row) => row.wardName ?? "—" },
      { field: "bedNumber", headerName: "Bed", flex: 0.6, minWidth: 90, valueGetter: (_, row) => row.bedNumber ?? "—" },
      {
        field: "admissionDate",
        headerName: "Admitted on",
        flex: 0.9,
        minWidth: 140,
        valueGetter: (_, row) => row.admissionDate.slice(0, 10),
      },
      {
        field: "status",
        headerName: "Status",
        width: 120,
        renderCell: (params) => (
          <Chip
            label={STATUS_LABEL[params.row.status]}
            color={STATUS_COLOR[params.row.status]}
            size="small"
          />
        ),
      },
    ],
    []
  );

  return (
    <Stack spacing={3}>
      <PageHeader
        title="IPD Admissions"
        subtitle="Monitor active and discharged inpatient admissions."
        actions={
          <>
            <Button variant={activeOnly ? "contained" : "outlined"} onClick={() => setActiveOnly(true)}>
              Active
            </Button>
            <Button variant={!activeOnly ? "contained" : "outlined"} onClick={() => setActiveOnly(false)}>
              All
            </Button>
            {canCreate ? (
              <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate("/ipd/admissions/new")}>
                New admission
              </Button>
            ) : null}
          </>
        }
      />

      {listQuery.isError && (
        <ErrorBanner message="Failed to load admissions." onRetry={() => void listQuery.refetch()} />
      )}

      <Box sx={{ height: 560, width: "100%" }}>
        <DataGrid
          rows={listQuery.data?.items ?? []}
          columns={columns}
          rowCount={listQuery.data?.total ?? 0}
          loading={listQuery.isFetching}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 20, 50]}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
          onRowClick={(params) => navigate(`/ipd/admissions/${params.row.id}`)}
        />
      </Box>
    </Stack>
  );
};

export default AdmissionListPage;
