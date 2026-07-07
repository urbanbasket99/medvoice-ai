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
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
} from "@mui/material";

import { medicineFormSchema } from "../schemas/pharmacySchema";
import type { MedicineFormValues } from "../schemas/pharmacySchema";
import { MEDICINE_CATEGORY_OPTIONS } from "../schemas/pharmacySchema";
import { CATEGORY_LABELS, medicineFormDefaultValues } from "../utils/pharmacyUtils";

export interface MedicineFormProps {
  open: boolean;
  defaultValues?: MedicineFormValues;
  onSubmit: (values: MedicineFormValues) => Promise<void> | void;
  onClose: () => void;
  isSubmitting?: boolean;
  serverError?: string | null;
  isEdit?: boolean;
}

const MedicineForm = ({
  open,
  defaultValues,
  onSubmit,
  onClose,
  isSubmitting = false,
  serverError,
  isEdit = false,
}: MedicineFormProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MedicineFormValues>({
    resolver: zodResolver(medicineFormSchema),
    defaultValues: defaultValues ?? medicineFormDefaultValues(),
  });

  const handleClose = () => {
    reset(defaultValues ?? medicineFormDefaultValues());
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEdit ? "Edit Medicine" : "Add Medicine"}</DialogTitle>
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
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Controller
                name="medicineCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Medicine Code"
                    size="small"
                    fullWidth
                    disabled={isEdit}
                    error={Boolean(errors.medicineCode)}
                    helperText={errors.medicineCode?.message}
                  />
                )}
              />
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Category" size="small" fullWidth error={Boolean(errors.category)}>
                    {MEDICINE_CATEGORY_OPTIONS.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {CATEGORY_LABELS[cat]}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Controller
                name="genericName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Generic Name"
                    size="small"
                    fullWidth
                    error={Boolean(errors.genericName)}
                    helperText={errors.genericName?.message}
                  />
                )}
              />
              <Controller
                name="brandName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Brand Name"
                    size="small"
                    fullWidth
                    error={Boolean(errors.brandName)}
                    helperText={errors.brandName?.message}
                  />
                )}
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Controller
                name="strength"
                control={control}
                render={({ field }) => <TextField {...field} label="Strength" size="small" fullWidth />}
              />
              <Controller
                name="dosageForm"
                control={control}
                render={({ field }) => <TextField {...field} label="Dosage Form" size="small" fullWidth />}
              />
            </Stack>
            <Controller
              name="manufacturer"
              control={control}
              render={({ field }) => <TextField {...field} label="Manufacturer" size="small" fullWidth />}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Controller
                name="mrp"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="MRP" size="small" fullWidth error={Boolean(errors.mrp)} helperText={errors.mrp?.message} />
                )}
              />
              <Controller
                name="sellingPrice"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Selling Price"
                    size="small"
                    fullWidth
                    error={Boolean(errors.sellingPrice)}
                    helperText={errors.sellingPrice?.message}
                  />
                )}
              />
              <Controller
                name="gst"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="GST %" size="small" fullWidth error={Boolean(errors.gst)} helperText={errors.gst?.message} />
                )}
              />
            </Stack>
            <Controller
              name="barcode"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Barcode (placeholder)"
                  size="small"
                  fullWidth
                  placeholder="Scan or enter barcode"
                />
              )}
            />
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <FormControlLabel control={<Switch checked={field.value} onChange={field.onChange} />} label="Active" />
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
              {isEdit ? "Save Changes" : "Add Medicine"}
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default MedicineForm;
