import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { useNavigate } from "react-router-dom";

import StockCard from "../components/StockCard";
import { useLowStock } from "../hooks/useStock";

const LowStockDashboardPage = () => {
  const navigate = useNavigate();
  const lowStockQuery = useLowStock();
  const items = lowStockQuery.data ?? [];

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Low Stock Alerts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Medicines at or below minimum stock levels.
          </Typography>
        </Box>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate("/pharmacy/inventory")}>
          Back to Inventory
        </Button>
      </Stack>

      {lowStockQuery.isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void lowStockQuery.refetch()}>
              Retry
            </Button>
          }
        >
          Failed to load low stock alerts.
        </Alert>
      )}

      {lowStockQuery.isSuccess && items.length === 0 && (
        <Alert severity="success">All medicines are above minimum stock levels.</Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" },
        }}
      >
        {items.map((stock) => (
          <StockCard key={stock.id} stock={stock} />
        ))}
      </Box>
    </Stack>
  );
};

export default LowStockDashboardPage;
