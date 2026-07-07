import { useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import { useNavigate } from "react-router-dom";
import type { GridPaginationModel } from "@mui/x-data-grid";

import { extractApiErrorMessage } from "../../../lib/extractApiErrorMessage";
import { useAuth } from "../../auth";
import InventoryTable from "../components/InventoryTable";
import PharmacySnackbar from "../components/PharmacySnackbar";
import StockAdjustDialog from "../components/StockAdjustDialog";
import { usePharmacySnackbar } from "../hooks/usePharmacySnackbar";
import { useAdjustStock } from "../hooks/useStockMutations";
import { useStockInventory } from "../hooks/useStock";
import type { StockAdjustFormValues } from "../schemas/pharmacySchema";
import type { MedicineStock } from "../types/pharmacy.types";
import { toStockAdjustPayload } from "../utils/pharmacyUtils";

const MedicineInventoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canUpdate = Boolean(user?.isSuperuser || user?.permissions.includes("pharmacy:update"));

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const [adjustTarget, setAdjustTarget] = useState<MedicineStock | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const { snackbar, showSuccess, closeSnackbar } = usePharmacySnackbar();

  const inventoryQuery = useStockInventory({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
  });
  const adjustStock = useAdjustStock();

  const handleAdjust = async (values: StockAdjustFormValues) => {
    setServerError(null);
    try {
      await adjustStock.mutateAsync(toStockAdjustPayload(values));
      showSuccess("Stock adjusted successfully.");
      setAdjustTarget(null);
    } catch (error) {
      setServerError(extractApiErrorMessage(error, "Could not adjust stock. Please try again."));
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Medicine Inventory
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View current stock levels across all medicines.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          <Button variant="outlined" startIcon={<WarningAmberRoundedIcon />} onClick={() => navigate("/pharmacy/stock/low")}>
            Low Stock
          </Button>
          <Button variant="outlined" startIcon={<HistoryRoundedIcon />} onClick={() => navigate("/pharmacy/stock/history")}>
            History
          </Button>
          <Button variant="outlined" onClick={() => navigate("/pharmacy/medicines")}>
            Medicine Master
          </Button>
        </Stack>
      </Stack>

      <InventoryTable
        rows={inventoryQuery.data?.items ?? []}
        rowCount={inventoryQuery.data?.total ?? 0}
        loading={inventoryQuery.isFetching}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        onAdjust={setAdjustTarget}
        canAdjust={canUpdate}
      />

      <StockAdjustDialog
        open={Boolean(adjustTarget)}
        stock={adjustTarget}
        onSubmit={handleAdjust}
        onClose={() => {
          setAdjustTarget(null);
          setServerError(null);
        }}
        isSubmitting={adjustStock.isPending}
        serverError={serverError}
      />
      <PharmacySnackbar state={snackbar} onClose={closeSnackbar} />
    </Stack>
  );
};

export default MedicineInventoryPage;
