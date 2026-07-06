import { useMemo } from "react";
import { Box, Button, Tooltip, Typography } from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import type { GridColDef, GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

import PatientStatusChip from "./PatientStatusChip";
import type { Gender, Patient } from "../types/patient.types";

export interface PatientTableProps {
  rows: Patient[];
  rowCount: number;
  loading: boolean;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  sortModel: GridSortModel;
  onSortModelChange: (model: GridSortModel) => void;
  onView: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
  onDeactivate: (patient: Patient) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

const GENDER_LABEL: Record<Gender, string> = { male: "Male", female: "Female", other: "Other" };

const formatDate = (isoDate: string): string => {
  const parsed = new Date(isoDate);
  return Number.isNaN(parsed.getTime()) ? "\u2014" : parsed.toLocaleDateString();
};

/**
 * CSV/PDF export are intentionally non-functional placeholders (Phase 1
 * scope) — per-column filtering and "manage columns" visibility are
 * already provided out of the box by each column header's built-in menu,
 * so no custom toolbar wiring was needed for those two.
 */
const PatientTableToolbar = () => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 1,
      flexWrap: "wrap",
      px: 2,
      py: 1,
    }}
  >
    <Typography variant="body2" color="text.secondary">
      Use a column&apos;s header menu to filter or hide columns.
    </Typography>
    <Box sx={{ display: "flex", gap: 1 }}>
      <Tooltip title="Coming soon">
        <span>
          <Button size="small" variant="outlined" startIcon={<FileDownloadRoundedIcon fontSize="small" />} disabled>
            Export CSV
          </Button>
        </span>
      </Tooltip>
      <Tooltip title="Coming soon">
        <span>
          <Button
            size="small"
            variant="outlined"
            startIcon={<PictureAsPdfRoundedIcon fontSize="small" />}
            disabled
          >
            Export PDF
          </Button>
        </span>
      </Tooltip>
    </Box>
  </Box>
);

const PatientTable = ({
  rows,
  rowCount,
  loading,
  paginationModel,
  onPaginationModelChange,
  sortModel,
  onSortModelChange,
  onView,
  onEdit,
  onDeactivate,
  canUpdate,
  canDelete,
}: PatientTableProps) => {
  const columns = useMemo<GridColDef<Patient>[]>(() => {
    const base: GridColDef<Patient>[] = [
      { field: "mrn", headerName: "MRN", width: 130 },
      { field: "uhid", headerName: "UHID", width: 150 },
      { field: "fullName", headerName: "Name", flex: 1, minWidth: 180 },
      { field: "age", headerName: "Age", width: 80, type: "number" },
      {
        field: "gender",
        headerName: "Gender",
        width: 110,
        valueFormatter: (value: Gender) => GENDER_LABEL[value] ?? value,
      },
      { field: "mobile", headerName: "Mobile", width: 140 },
      { field: "email", headerName: "Email", flex: 1, minWidth: 200 },
      {
        field: "status",
        headerName: "Status",
        width: 120,
        renderCell: (params) => <PatientStatusChip status={params.row.status} />,
      },
      {
        field: "createdAt",
        headerName: "Registered",
        width: 150,
        valueFormatter: (value: string) => formatDate(value),
      },
    ];

    return [
      ...base,
      {
        field: "actions",
        type: "actions",
        headerName: "Actions",
        width: 140,
        getActions: (params) => {
          const actions = [
            <GridActionsCellItem
              key="view"
              icon={<VisibilityRoundedIcon fontSize="small" />}
              label="View"
              onClick={() => onView(params.row)}
            />,
          ];
          if (canUpdate) {
            actions.push(
              <GridActionsCellItem
                key="edit"
                icon={<EditRoundedIcon fontSize="small" />}
                label="Edit"
                onClick={() => onEdit(params.row)}
              />
            );
          }
          if (canDelete && params.row.status === "active") {
            actions.push(
              <GridActionsCellItem
                key="deactivate"
                icon={<DeleteOutlineRoundedIcon fontSize="small" />}
                label="Deactivate"
                onClick={() => onDeactivate(params.row)}
              />
            );
          }
          return actions;
        },
      },
    ];
  }, [canUpdate, canDelete, onView, onEdit, onDeactivate]);

  return (
    <DataGrid<Patient>
      autoHeight
      rows={rows}
      columns={columns}
      loading={loading}
      rowCount={rowCount}
      paginationMode="server"
      sortingMode="server"
      paginationModel={paginationModel}
      onPaginationModelChange={onPaginationModelChange}
      sortModel={sortModel}
      onSortModelChange={onSortModelChange}
      pageSizeOptions={[10, 20, 50, 100]}
      disableRowSelectionOnClick
      slots={{ toolbar: PatientTableToolbar }}
      slotProps={{ loadingOverlay: { variant: "skeleton", noRowsVariant: "skeleton" } }}
      sx={{ backgroundColor: "background.paper" }}
    />
  );
};

export default PatientTable;
