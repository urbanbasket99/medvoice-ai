import { useMemo } from "react";
import { Chip } from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import type { GridColDef, GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

import {
  APPOINTMENT_PRIORITY_LABELS,
  APPOINTMENT_TYPE_LABELS,
  DEPARTMENT_LABELS,
} from "../schemas/appointmentSchema";
import AppointmentStatusChip from "./AppointmentStatusChip";
import { formatDisplayDate, formatDisplayTime } from "../utils/dateUtils";
import type { Appointment } from "../types/appointment.types";

export interface AppointmentTableProps {
  rows: Appointment[];
  rowCount: number;
  loading: boolean;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  sortModel: GridSortModel;
  onSortModelChange: (model: GridSortModel) => void;
  onView: (appointment: Appointment) => void;
  onEdit: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

const AppointmentTable = ({
  rows,
  rowCount,
  loading,
  paginationModel,
  onPaginationModelChange,
  sortModel,
  onSortModelChange,
  onView,
  onEdit,
  onCancel,
  canUpdate,
  canDelete,
}: AppointmentTableProps) => {
  const columns = useMemo<GridColDef<Appointment>[]>(() => {
    const base: GridColDef<Appointment>[] = [
      { field: "appointmentNumber", headerName: "Appt #", width: 130 },
      { field: "tokenNumber", headerName: "Token", width: 80, type: "number" },
      { field: "patientName", headerName: "Patient", flex: 1, minWidth: 160 },
      { field: "doctorName", headerName: "Doctor", width: 160 },
      {
        field: "department",
        headerName: "Department",
        width: 150,
        renderCell: (params) => (
          <Chip size="small" label={DEPARTMENT_LABELS[params.row.department]} variant="outlined" />
        ),
      },
      {
        field: "appointmentDate",
        headerName: "Date",
        width: 130,
        valueFormatter: (value: string) => formatDisplayDate(value),
      },
      {
        field: "appointmentTime",
        headerName: "Time",
        width: 100,
        valueFormatter: (value: string) => formatDisplayTime(value),
      },
      {
        field: "appointmentType",
        headerName: "Type",
        width: 120,
        valueFormatter: (value: Appointment["appointmentType"]) => APPOINTMENT_TYPE_LABELS[value],
      },
      {
        field: "priority",
        headerName: "Priority",
        width: 100,
        valueFormatter: (value: Appointment["priority"]) => APPOINTMENT_PRIORITY_LABELS[value],
      },
      {
        field: "status",
        headerName: "Status",
        width: 130,
        renderCell: (params) => <AppointmentStatusChip status={params.row.status} />,
      },
    ];

    if (canUpdate || canDelete) {
      base.push({
        field: "actions",
        type: "actions",
        headerName: "Actions",
        width: 120,
        getActions: (params) => {
          const actions = [
            <GridActionsCellItem
              key="view"
              icon={<VisibilityRoundedIcon />}
              label="View"
              onClick={() => onView(params.row)}
            />,
          ];
          if (canUpdate && params.row.status !== "cancelled" && params.row.status !== "completed") {
            actions.push(
              <GridActionsCellItem
                key="edit"
                icon={<EditRoundedIcon />}
                label="Edit"
                onClick={() => onEdit(params.row)}
              />
            );
          }
          if (canDelete && params.row.status !== "cancelled" && params.row.status !== "completed") {
            actions.push(
              <GridActionsCellItem
                key="cancel"
                icon={<DeleteOutlineRoundedIcon />}
                label="Cancel"
                onClick={() => onCancel(params.row)}
              />
            );
          }
          return actions;
        },
      });
    }

    return base;
  }, [canDelete, canUpdate, onCancel, onEdit, onView]);

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      getRowId={(row) => row.id}
      rowCount={rowCount}
      loading={loading}
      paginationMode="server"
      sortingMode="server"
      paginationModel={paginationModel}
      onPaginationModelChange={onPaginationModelChange}
      sortModel={sortModel}
      onSortModelChange={onSortModelChange}
      pageSizeOptions={[10, 20, 50]}
      disableRowSelectionOnClick
      autoHeight
      sx={{ border: 0 }}
    />
  );
};

export default AppointmentTable;
