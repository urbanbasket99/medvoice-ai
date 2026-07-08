import { useMemo } from "react";
import { Chip } from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import type { GridColDef, GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

import { DataGridNoRowsOverlay, dataGridSx } from "../../../components/ui";
import { formatDisplayDate, getStatusChipColor, STATUS_LABELS } from "../utils/pharmacyUtils";
import type { DispenseRecord } from "../types/pharmacy.types";

export interface DispenseTableProps {
  rows: DispenseRecord[];
  rowCount: number;
  loading: boolean;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  sortModel: GridSortModel;
  onSortModelChange: (model: GridSortModel) => void;
  onView: (dispense: DispenseRecord) => void;
  onDelete: (dispense: DispenseRecord) => void;
  canDelete: boolean;
}

const DispenseTable = ({
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
}: DispenseTableProps) => {
  const columns = useMemo<GridColDef<DispenseRecord>[]>(() => {
    const base: GridColDef<DispenseRecord>[] = [
      { field: "orderNumber", headerName: "Order #", width: 130 },
      { field: "consultationVisitNumber", headerName: "Visit #", width: 120 },
      { field: "patientName", headerName: "Patient", flex: 1, minWidth: 160 },
      { field: "doctorName", headerName: "Doctor", width: 160 },
      {
        field: "status",
        headerName: "Status",
        width: 130,
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
        headerName: "Items",
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
      slots={{ noRowsOverlay: DataGridNoRowsOverlay }}
      sx={dataGridSx}
    />
  );
};

export default DispenseTable;
