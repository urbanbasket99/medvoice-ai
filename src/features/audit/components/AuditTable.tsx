import { useMemo } from "react";
import { Chip } from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import type { GridColDef, GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";

import { DataGridNoRowsOverlay, dataGridSx } from "../../../components/ui";

import {
  AUDIT_ACTION_LABELS,
  formatAuditTimestamp,
  formatModuleLabel,
  getActionChipColor,
} from "../utils/auditUtils";
import type { AuditLog } from "../types/audit.types";

export interface AuditTableProps {
  rows: AuditLog[];
  rowCount: number;
  loading: boolean;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  sortModel: GridSortModel;
  onSortModelChange: (model: GridSortModel) => void;
  onView: (log: AuditLog) => void;
}

const AuditTable = ({
  rows,
  rowCount,
  loading,
  paginationModel,
  onPaginationModelChange,
  sortModel,
  onSortModelChange,
  onView,
}: AuditTableProps) => {
  const columns = useMemo<GridColDef<AuditLog>[]>(
    () => [
      {
        field: "timestamp",
        headerName: "Timestamp",
        width: 180,
        valueFormatter: (value: string) => formatAuditTimestamp(value),
      },
      { field: "userName", headerName: "User", width: 150, valueGetter: (_, row) => row.userName ?? "—" },
      {
        field: "module",
        headerName: "Module",
        width: 130,
        valueFormatter: (value: string) => formatModuleLabel(value),
      },
      { field: "entity", headerName: "Entity", width: 120 },
      {
        field: "action",
        headerName: "Action",
        width: 140,
        renderCell: (params) => (
          <Chip
            size="small"
            label={AUDIT_ACTION_LABELS[params.row.action]}
            color={getActionChipColor(params.row.action)}
          />
        ),
      },
      { field: "description", headerName: "Description", flex: 1, minWidth: 260 },
      {
        field: "actions",
        type: "actions",
        headerName: "Actions",
        width: 80,
        getActions: (params) => [
          <GridActionsCellItem
            key="view"
            icon={<VisibilityRoundedIcon />}
            label="View details"
            onClick={() => onView(params.row)}
          />,
        ],
      },
    ],
    [onView],
  );

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

export default AuditTable;
