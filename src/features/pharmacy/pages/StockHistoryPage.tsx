import { useMemo, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { useNavigate } from "react-router-dom";
import type { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { DataGrid } from "@mui/x-data-grid";

import { DataGridNoRowsOverlay, dataGridSx } from "../../../components/ui";
import { MOVEMENT_TYPE_LABELS, formatDisplayDateTime } from "../utils/pharmacyUtils";
import { useStockHistory } from "../hooks/useStock";
import type { StockMovement } from "../types/pharmacy.types";

const StockHistoryPage = () => {
  const navigate = useNavigate();
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });

  const historyQuery = useStockHistory({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
  });

  const columns = useMemo<GridColDef<StockMovement>[]>(
    () => [
      {
        field: "createdAt",
        headerName: "Date",
        width: 170,
        valueFormatter: (value: string) => formatDisplayDateTime(value),
      },
      { field: "medicineName", headerName: "Medicine", flex: 1, minWidth: 160 },
      { field: "batchNumber", headerName: "Batch", width: 120 },
      {
        field: "movementType",
        headerName: "Type",
        width: 120,
        valueGetter: (_, row) => MOVEMENT_TYPE_LABELS[row.movementType] ?? row.movementType,
      },
      {
        field: "quantityDelta",
        headerName: "Delta",
        width: 90,
        renderCell: (params) => (
          <Typography
            variant="body2"
            sx={{ color: params.row.quantityDelta >= 0 ? "success.main" : "error.main", fontWeight: 600 }}
          >
            {params.row.quantityDelta >= 0 ? `+${params.row.quantityDelta}` : params.row.quantityDelta}
          </Typography>
        ),
      },
      { field: "notes", headerName: "Notes", flex: 1, minWidth: 160 },
    ],
    []
  );

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Stock History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Audit trail of all stock movements.
          </Typography>
        </Box>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate("/pharmacy/inventory")}>
          Back to Inventory
        </Button>
      </Stack>

      <DataGrid
        rows={historyQuery.data?.items ?? []}
        columns={columns}
        getRowId={(row) => row.id}
        rowCount={historyQuery.data?.total ?? 0}
        loading={historyQuery.isFetching}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 20, 50]}
        disableRowSelectionOnClick
        autoHeight
        slots={{ noRowsOverlay: DataGridNoRowsOverlay }}
        sx={dataGridSx}
      />
    </Stack>
  );
};

export default StockHistoryPage;
