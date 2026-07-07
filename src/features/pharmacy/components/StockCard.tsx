import { Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

import { CATEGORY_LABELS, formatDisplayDate, isLowStock } from "../utils/pharmacyUtils";
import type { MedicineStock } from "../types/pharmacy.types";

export interface StockCardProps {
  stock: MedicineStock;
  onAdjust?: (stock: MedicineStock) => void;
}

const StockCard = ({ stock }: StockCardProps) => {
  const low = isLowStock(stock.currentStock, stock.minimumStock);

  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start", justifyContent: "space-between" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {stock.brandName ?? "Unknown"}
            </Typography>
            {low && <Chip size="small" color="warning" icon={<WarningAmberRoundedIcon />} label="Low Stock" />}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {stock.medicineCode ?? "—"} • {stock.genericName ?? "—"}
          </Typography>
          {stock.category && (
            <Typography variant="caption" color="text.secondary">
              {CATEGORY_LABELS[stock.category] ?? stock.category}
              {stock.strength ? ` • ${stock.strength}` : ""}
            </Typography>
          )}
          <Stack direction="row" spacing={2}>
            <Stack>
              <Typography variant="caption" color="text.secondary">
                Current
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: low ? "warning.main" : "text.primary" }}>
                {stock.currentStock}
              </Typography>
            </Stack>
            <Stack>
              <Typography variant="caption" color="text.secondary">
                Reserved
              </Typography>
              <Typography variant="body1">{stock.reservedStock}</Typography>
            </Stack>
            <Stack>
              <Typography variant="caption" color="text.secondary">
                Minimum
              </Typography>
              <Typography variant="body1">{stock.minimumStock}</Typography>
            </Stack>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Updated {formatDisplayDate(stock.updatedAt)}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default StockCard;
