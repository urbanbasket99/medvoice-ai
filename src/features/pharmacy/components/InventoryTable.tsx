import { useMemo } from "react";
import { Chip } from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import type { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import UndoRoundedIcon from "@mui/icons-material/UndoRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";

import { DataGridNoRowsOverlay, dataGridSx } from "../../../components/ui";
import { CATEGORY_LABELS, formatDisplayDate, isLowStock } from "../utils/pharmacyUtils";
import type { MedicineStock } from "../types/pharmacy.types";

export interface InventoryTableProps {
  rows: MedicineStock[];
  rowCount: number;
  loading: boolean;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  onAdjust?: (stock: MedicineStock) => void;
  onReturn?: (stock: MedicineStock) => void;
  canAdjust?: boolean;
}

const InventoryTable = ({
  rows,
  rowCount,
  loading,
  paginationModel,
  onPaginationModelChange,
  onAdjust,
  onReturn,
  canAdjust = false,
}: InventoryTableProps) => {
  const columns = useMemo<GridColDef<MedicineStock>[]>(() => {
    const base: GridColDef<MedicineStock>[] = [
      { field: "medicineCode", headerName: "Code", width: 110 },
      { field: "brandName", headerName: "Brand", flex: 1, minWidth: 160 },
      { field: "genericName", headerName: "Generic", width: 160 },
      {
        field: "category",
        headerName: "Category",
        width: 110,
        valueGetter: (_, row) => (row.category ? CATEGORY_LABELS[row.category] ?? row.category : "—"),
      },
      { field: "currentStock", headerName: "Stock", width: 90 },
      { field: "reservedStock", headerName: "Reserved", width: 100 },
      { field: "minimumStock", headerName: "Min", width: 80 },
      {
        field: "status",
        headerName: "Status",
        width: 110,
        sortable: false,
        renderCell: (params) =>
          isLowStock(params.row.currentStock, params.row.minimumStock) ? (
            <Chip size="small" color="warning" label="Low" />
          ) : (
            <Chip size="small" color="success" label="OK" />
          ),
      },
      {
        field: "updatedAt",
        headerName: "Updated",
        width: 120,
        valueFormatter: (value: string) => formatDisplayDate(value.slice(0, 10)),
      },
    ];

    if (canAdjust && (onAdjust || onReturn)) {
      base.push({
        field: "actions",
        type: "actions",
        headerName: "Actions",
        width: 110,
        getActions: (params) => {
          const actions = [];
          if (onAdjust) {
            actions.push(
              <GridActionsCellItem
                key="adjust"
                icon={<TuneRoundedIcon />}
                label="Adjust Stock"
                onClick={() => onAdjust(params.row)}
              />
            );
          }
          if (onReturn) {
            actions.push(
              <GridActionsCellItem
                key="return"
                icon={<UndoRoundedIcon />}
                label="Stock Return"
                onClick={() => onReturn(params.row)}
              />
            );
          }
          return actions;
        },
      });
    }

    return base;
  }, [canAdjust, onAdjust, onReturn]);

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
      slots={{ noRowsOverlay: DataGridNoRowsOverlay }}
      sx={dataGridSx}
    />
  );
};

export default InventoryTable;
