import { useMemo } from "react";
import { Chip } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridPaginationModel } from "@mui/x-data-grid";

import { formatDisplayDate, formatPrice, IMAGING_CATEGORY_LABELS } from "../utils/radiologyUtils";
import type { RadiologyTestMaster } from "../types/radiology.types";

export interface RadiologyTestMasterTableProps {
  rows: RadiologyTestMaster[];
  rowCount: number;
  loading: boolean;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
}

const RadiologyTestMasterTable = ({
  rows,
  rowCount,
  loading,
  paginationModel,
  onPaginationModelChange,
}: RadiologyTestMasterTableProps) => {
  const columns = useMemo<GridColDef<RadiologyTestMaster>[]>(
    () => [
      { field: "testCode", headerName: "Code", width: 120 },
      { field: "testName", headerName: "Test Name", flex: 1, minWidth: 200 },
      {
        field: "category",
        headerName: "Category",
        width: 140,
        valueGetter: (_, row) => IMAGING_CATEGORY_LABELS[row.category] ?? row.category,
      },
      { field: "bodyPart", headerName: "Body Part", width: 140 },
      { field: "estimatedDuration", headerName: "Duration", width: 120 },
      {
        field: "price",
        headerName: "Price",
        width: 110,
        valueFormatter: (value: string | null) => formatPrice(value),
      },
      {
        field: "isActive",
        headerName: "Status",
        width: 100,
        renderCell: (params) => (
          <Chip
            size="small"
            label={params.row.isActive ? "Active" : "Inactive"}
            color={params.row.isActive ? "success" : "default"}
          />
        ),
      },
      {
        field: "createdAt",
        headerName: "Created",
        width: 120,
        valueFormatter: (value: string) => formatDisplayDate(value.slice(0, 10)),
      },
    ],
    []
  );

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      getRowId={(row) => row.id}
      rowCount={rowCount}
      loading={loading}
      paginationMode="server"
      paginationModel={paginationModel}
      onPaginationModelChange={onPaginationModelChange}
      pageSizeOptions={[10, 20, 50]}
      disableRowSelectionOnClick
      autoHeight
      sx={{ border: 0 }}
    />
  );
};

export default RadiologyTestMasterTable;
