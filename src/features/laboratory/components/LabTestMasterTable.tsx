import { useMemo } from "react";
import { Chip } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridPaginationModel } from "@mui/x-data-grid";

import { formatDisplayDate, formatPrice, SAMPLE_TYPE_LABELS } from "../utils/laboratoryUtils";
import type { LabTestMaster } from "../types/laboratory.types";

export interface LabTestMasterTableProps {
  rows: LabTestMaster[];
  rowCount: number;
  loading: boolean;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
}

const LabTestMasterTable = ({
  rows,
  rowCount,
  loading,
  paginationModel,
  onPaginationModelChange,
}: LabTestMasterTableProps) => {
  const columns = useMemo<GridColDef<LabTestMaster>[]>(
    () => [
      { field: "testCode", headerName: "Code", width: 120 },
      { field: "testName", headerName: "Test Name", flex: 1, minWidth: 200 },
      { field: "department", headerName: "Department", width: 160 },
      {
        field: "sampleType",
        headerName: "Sample Type",
        width: 130,
        valueGetter: (_, row) => SAMPLE_TYPE_LABELS[row.sampleType] ?? row.sampleType,
      },
      { field: "normalTurnaroundTime", headerName: "TAT", width: 120 },
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
          <Chip size="small" label={params.row.isActive ? "Active" : "Inactive"} color={params.row.isActive ? "success" : "default"} />
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

export default LabTestMasterTable;
