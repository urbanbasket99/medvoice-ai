import { useMemo } from "react";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import type { GridColDef, GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

import ConsultationStatusChip from "./ConsultationStatusChip";
import { formatDisplayDate } from "../utils/consultationUtils";
import type { Consultation } from "../types/consultation.types";

export interface ConsultationTableProps {
  rows: Consultation[];
  rowCount: number;
  loading: boolean;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  sortModel: GridSortModel;
  onSortModelChange: (model: GridSortModel) => void;
  onView: (consultation: Consultation) => void;
  onEdit: (consultation: Consultation) => void;
  onCancel: (consultation: Consultation) => void;
  canUpdate: boolean;
  canDelete: boolean;
}

const ConsultationTable = ({
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
}: ConsultationTableProps) => {
  const columns = useMemo<GridColDef<Consultation>[]>(() => {
    const base: GridColDef<Consultation>[] = [
      { field: "visitNumber", headerName: "Visit #", width: 120 },
      { field: "patientName", headerName: "Patient", flex: 1, minWidth: 160 },
      { field: "doctorName", headerName: "Doctor", width: 160 },
      { field: "appointmentNumber", headerName: "Appointment", width: 130 },
      { field: "diagnosis", headerName: "Diagnosis", width: 180 },
      {
        field: "status",
        headerName: "Status",
        width: 130,
        renderCell: (params) => <ConsultationStatusChip status={params.row.status} />,
      },
      {
        field: "createdAt",
        headerName: "Created",
        width: 120,
        valueFormatter: (value: string) => formatDisplayDate(value.slice(0, 10)),
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
            <GridActionsCellItem key="view" icon={<VisibilityRoundedIcon />} label="View" onClick={() => onView(params.row)} />,
          ];
          if (canUpdate && params.row.status !== "cancelled" && params.row.status !== "completed") {
            actions.push(
              <GridActionsCellItem key="edit" icon={<EditRoundedIcon />} label="Edit" onClick={() => onEdit(params.row)} />
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

export default ConsultationTable;
