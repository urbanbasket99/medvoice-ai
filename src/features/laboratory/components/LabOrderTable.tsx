import { useMemo } from "react";
import { Chip } from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import type { GridColDef, GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

import {
  formatDisplayDate,
  getPriorityChipColor,
  getStatusChipColor,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from "../utils/laboratoryUtils";
import type { LabOrder } from "../types/laboratory.types";

export interface LabOrderTableProps {
  rows: LabOrder[];
  rowCount: number;
  loading: boolean;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  sortModel: GridSortModel;
  onSortModelChange: (model: GridSortModel) => void;
  onView: (labOrder: LabOrder) => void;
  onDelete: (labOrder: LabOrder) => void;
  canDelete: boolean;
}

const LabOrderTable = ({
  rows,
  rowCount,
  loading,
  paginationModel,
  onPaginationModelChange,
  sortModel,
  onSortModelChange,
  onView,
  onDelete,
  canDelete,
}: LabOrderTableProps) => {
  const columns = useMemo<GridColDef<LabOrder>[]>(() => {
    const base: GridColDef<LabOrder>[] = [
      { field: "orderNumber", headerName: "Order #", width: 130 },
      { field: "consultationVisitNumber", headerName: "Visit #", width: 120 },
      { field: "patientName", headerName: "Patient", flex: 1, minWidth: 160 },
      { field: "doctorName", headerName: "Doctor", width: 160 },
      {
        field: "priority",
        headerName: "Priority",
        width: 110,
        renderCell: (params) => (
          <Chip
            size="small"
            label={PRIORITY_LABELS[params.row.priority]}
            color={getPriorityChipColor(params.row.priority)}
          />
        ),
      },
      {
        field: "status",
        headerName: "Status",
        width: 150,
        renderCell: (params) => (
          <Chip
            size="small"
            label={STATUS_LABELS[params.row.status]}
            color={getStatusChipColor(params.row.status)}
          />
        ),
      },
      {
        field: "items",
        headerName: "Tests",
        width: 80,
        sortable: false,
        valueGetter: (_, row) => row.items.length,
      },
      {
        field: "createdAt",
        headerName: "Created",
        width: 120,
        valueFormatter: (value: string) => formatDisplayDate(value.slice(0, 10)),
      },
    ];

    base.push({
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: canDelete ? 100 : 70,
      getActions: (params) => {
        const actions = [
          <GridActionsCellItem key="view" icon={<VisibilityRoundedIcon />} label="View" onClick={() => onView(params.row)} />,
        ];
        if (canDelete) {
          actions.push(
            <GridActionsCellItem
              key="delete"
              icon={<DeleteOutlineRoundedIcon />}
              label="Delete"
              onClick={() => onDelete(params.row)}
            />
          );
        }
        return actions;
      },
    });

    return base;
  }, [canDelete, onDelete, onView]);

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

export default LabOrderTable;
