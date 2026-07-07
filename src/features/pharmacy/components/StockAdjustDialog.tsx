import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";

import { stockAdjustFormSchema } from "../schemas/pharmacySchema";
import type { StockAdjustFormValues } from "../schemas/pharmacySchema";
import { stockAdjustFormDefaultValues } from "../utils/pharmacyUtils";
import BatchSelector from "./BatchSelector";
import type { MedicineStock } from "../types/pharmacy.types";

export interface StockAdjustDialogProps {
  open: boolean;
  stock: MedicineStock | null;
  onSubmit: (values: StockAdjustFormValues) => Promise<void> | void;
  onClose: () => void;
  isSubmitting?: boolean;
  serverError?: string | null;
}

const StockAdjustDialog = ({
  open,
  stock,
  onSubmit,
  onClose,
  isSubmitting = false,
  serverError,
}: StockAdjustDialogProps) => {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<StockAdjustFormValues>({
    resolver: zodResolver(stockAdjustFormSchema),
    defaultValues: stockAdjustFormDefaultValues(stock?.medicineId ?? ""),
  });

  const medicineId = watch("medicineId");

  const handleClose = () => {
    reset(stockAdjustFormDefaultValues(stock?.medicineId ?? ""));
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Adjust Stock</DialogTitle>
      <form
        onSubmit={(event) => {
          void handleSubmit(async (values) => {
            await onSubmit(values);
          })(event);
        }}
      >
        <DialogContent>
          <Stack spacing={2}>
            {serverError && <Alert severity="error">{serverError}</Alert>}
            {stock && (
              <Alert severity="info">
                Adjusting stock for <strong>{stock.brandName}</strong> (current: {stock.currentStock})
              </Alert>
            )}
            <Controller
              name="quantityDelta"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Quantity Delta"
                  type="number"
                  size="small"
                  fullWidth
                  helperText={errors.quantityDelta?.message ?? "Positive to add, negative to remove"}
                  error={Boolean(errors.quantityDelta)}
                />
              )}
            />
            <Controller
              name="batchId"
              control={control}
              render={({ field }) => (
                <BatchSelector
                  medicineId={medicineId || stock?.medicineId || null}
                  value={field.value ?? null}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Notes" size="small" fullWidth multiline minRows={2} />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Box>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : undefined}
            >
              Adjust Stock
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default StockAdjustDialog;
