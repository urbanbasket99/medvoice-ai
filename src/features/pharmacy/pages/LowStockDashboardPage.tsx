import { Box, Button, Stack } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { useNavigate } from "react-router-dom";

import { EmptyState, ErrorBanner, PageHeader } from "../../../components/ui";

import StockCard from "../components/StockCard";
import { useLowStock } from "../hooks/useStock";

const LowStockDashboardPage = () => {
  const navigate = useNavigate();
  const lowStockQuery = useLowStock();
  const items = lowStockQuery.data ?? [];

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Low Stock Alerts"
        subtitle="Medicines at or below minimum stock levels."
        actions={
          <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate("/pharmacy/inventory")}>
            Back to Inventory
          </Button>
        }
      />

      {lowStockQuery.isError && (
        <ErrorBanner message="Failed to load low stock alerts." onRetry={() => void lowStockQuery.refetch()} />
      )}

      {lowStockQuery.isSuccess && items.length === 0 && (
        <EmptyState title="All medicines are above minimum stock levels." />
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
