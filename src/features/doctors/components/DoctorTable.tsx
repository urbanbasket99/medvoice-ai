import { useMemo } from "react";
import { Avatar, Chip } from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import type { GridColDef, GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

import { DEPARTMENT_LABELS } from "../schemas/doctorSchema";
import DoctorStatusChip from "./DoctorStatusChip";
import type { Doctor, Gender } from "../types/doctor.types";

export interface DoctorTableProps {
  rows: Doctor[];
  rowCount: number;
  loading: boolean;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  sortModel: GridSortModel;
  onSortModelChange: (model: GridSortModel) => void;
  onView: (doctor: Doctor) => void;
  onEdit: (doctor: Doctor) => void;
  onDeactivate: (doctor: Doctor) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

const GENDER_LABEL: Record<Gender, string> = { male: "Male", female: "Female", other: "Other" };

const formatDate = (isoDate: string): string => {
  const parsed = new Date(isoDate);
  return Number.isNaN(parsed.getTime()) ? "\u2014" : parsed.toLocaleDateString();
};

const formatFee = (fee: number | null): string =>
  fee === null ? "\u2014" : `\u20B9${fee.toLocaleString()}`;

const DoctorTable = ({
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
}: DoctorTableProps) => {
  const columns = useMemo<GridColDef<Doctor>[]>(() => {
    const base: GridColDef<Doctor>[] = [
      {
        field: "photoUrl",
        headerName: "",
        width: 56,
        sortable: false,
        renderCell: (params) => (
          <Avatar src={params.row.photoUrl ?? undefined} sx={{ width: 32, height: 32, fontSize: 14 }}>
            {params.row.fullName.charAt(0)}
          </Avatar>
        ),
      },
      { field: "doctorCode", headerName: "Code", width: 130 },
      { field: "fullName", headerName: "Name", flex: 1, minWidth: 180 },
      {
        field: "department",
        headerName: "Department",
        width: 160,
        renderCell: (params) => (
          <Chip size="small" label={DEPARTMENT_LABELS[params.row.department]} variant="outlined" />
        ),
      },
      { field: "specialization", headerName: "Specialization", width: 160 },
      { field: "experienceYears", headerName: "Exp.", width: 80, type: "number" },
      {
        field: "gender",
        headerName: "Gender",
        width: 100,
        valueFormatter: (value: Gender) => GENDER_LABEL[value] ?? value,
      },
      { field: "mobile", headerName: "Mobile", width: 140 },
      {
        field: "consultationFee",
        headerName: "Fee",
        width: 100,
        valueFormatter: (value: number | null) => formatFee(value),
      },
      {
        field: "status",
        headerName: "Status",
        width: 120,
        renderCell: (params) => <DoctorStatusChip status={params.row.status} />,
      },
      {
        field: "joiningDate",
        headerName: "Joined",
        width: 120,
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
    <DataGrid<Doctor>
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
      slotProps={{ loadingOverlay: { variant: "skeleton", noRowsVariant: "skeleton" } }}
      sx={{ backgroundColor: "background.paper" }}
    />
  );
};

export default DoctorTable;
