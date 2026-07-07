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
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";

import { batchFormSchema } from "../schemas/pharmacySchema";
import type { BatchFormValues } from "../schemas/pharmacySchema";
import { batchFormDefaultValues } from "../utils/pharmacyUtils";
import { useSuppliers } from "../hooks/useSuppliers";
import MedicineSearch from "./MedicineSearch";

export interface BatchFormProps {
  open: boolean;
  defaultValues?: BatchFormValues;
  onSubmit: (values: BatchFormValues) => Promise<void> | void;
  onClose: () => void;
  isSubmitting?: boolean;
  serverError?: string | null;
  isEdit?: boolean;
}

const BatchForm = ({
  open,
  defaultValues,
  onSubmit,
  onClose,
  isSubmitting = false,
  serverError,
  isEdit = false,
}: BatchFormProps) => {
  const suppliersQuery = useSuppliers();
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BatchFormValues>({
    resolver: zodResolver(batchFormSchema),
    defaultValues: defaultValues ?? batchFormDefaultValues(),
  });

  const medicineId = watch("medicineId");

  const handleClose = () => {
    reset(defaultValues ?? batchFormDefaultValues());
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? "Edit Batch" : "Add Batch"}</DialogTitle>
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
            {!isEdit && (
              <MedicineSearch
                value={null}
                onChange={(value) => {
                  if (value && typeof value !== "string") {
                    setValue("medicineId", value.id, { shouldValidate: true });
                  }
                }}
                label="Select Medicine"
                error={Boolean(errors.medicineId)}
                helperText={errors.medicineId?.message}
              />
            )}
            {isEdit && medicineId && (
              <TextField label="Medicine ID" size="small" fullWidth value={medicineId} disabled />
            )}
            <Controller
              name="batchNumber"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Batch Number"
                  size="small"
                  fullWidth
                  error={Boolean(errors.batchNumber)}
                  helperText={errors.batchNumber?.message}
                />
              )}
            />
            <Controller
              name="expiryDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Expiry Date"
                  type="date"
                  size="small"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  error={Boolean(errors.expiryDate)}
                  helperText={errors.expiryDate?.message}
                />
              )}
            />
            <Controller
              name="quantity"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Quantity"
                  type="number"
                  size="small"
                  fullWidth
                  error={Boolean(errors.quantity)}
                  helperText={errors.quantity?.message}
                />
              )}
            />
            <Stack direction="row" spacing={2}>
              <Controller
                name="purchasePrice"
                control={control}
                render={({ field }) => <TextField {...field} label="Purchase Price" size="small" fullWidth />}
              />
              <Controller
                name="sellingPrice"
                control={control}
                render={({ field }) => <TextField {...field} label="Selling Price" size="small" fullWidth />}
              />
            </Stack>
            <Controller
              name="supplierId"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Supplier" size="small" fullWidth value={field.value ?? ""}>
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {(suppliersQuery.data?.items ?? []).map((supplier) => (
                    <MenuItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </MenuItem>
                  ))}
                </TextField>
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
              {isEdit ? "Save Changes" : "Add Batch"}
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default BatchForm;
