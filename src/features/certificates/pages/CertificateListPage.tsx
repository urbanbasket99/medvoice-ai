import { useState } from "react";
import { Box, Button, Stack } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { DataGrid, type GridColDef, type GridPaginationModel } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";

import { ErrorBanner, PageHeader } from "../../../components/ui";
import { useAuth } from "../../auth";
import { useCertificates } from "../hooks/useCertificates";
import type { MedicalCertificate } from "../types/certificate.types";
import { CERTIFICATE_TYPE_LABELS, formatDisplayDate } from "../utils/certificateUtils";

const CertificateListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canCreate = Boolean(user?.isSuperuser || user?.permissions.includes("certificates:create"));
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });

  const listQuery = useCertificates({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
  });

  const columns: GridColDef<MedicalCertificate>[] = [
    { field: "certificateNumber", headerName: "Number", flex: 0.8, minWidth: 120 },
    {
      field: "certificateType",
      headerName: "Type",
      flex: 0.8,
      minWidth: 120,
      valueGetter: (_, row) => CERTIFICATE_TYPE_LABELS[row.certificateType] ?? row.certificateType,
    },
    {
      field: "patientName",
      headerName: "Patient",
      flex: 1.2,
      minWidth: 160,
      valueGetter: (_, row) => row.patientName ?? "—",
    },
    {
      field: "doctorName",
      headerName: "Doctor",
      flex: 1,
      minWidth: 140,
      valueGetter: (_, row) => row.doctorName ?? "—",
    },
    {
      field: "issueDate",
      headerName: "Issue Date",
      flex: 0.8,
      minWidth: 120,
      valueGetter: (_, row) => formatDisplayDate(row.issueDate),
    },
  ];

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Medical Certificates"
        subtitle="Issue and print fitness, leave, and medical certificates."
        actions={
          canCreate ? (
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate("/certificates/new")}>
              New Certificate
            </Button>
          ) : undefined
        }
      />

      {listQuery.isError && (
        <ErrorBanner message="Failed to load certificates." onRetry={() => void listQuery.refetch()} />
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
          disableRowSelectionOnClick
          onRowClick={(params) => navigate(`/certificates/${params.row.id}`)}
        />
      </Box>
    </Stack>
  );
};

export default CertificateListPage;
