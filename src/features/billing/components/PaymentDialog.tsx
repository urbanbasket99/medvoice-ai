import {
  Alert,
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
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { paymentFormSchema, type PaymentFormValues } from "../schemas/billingSchema";
import { PAYMENT_METHOD_LABELS, PAYMENT_METHOD_OPTIONS } from "../utils/billingUtils";

interface PaymentDialogProps {
  open: boolean;
  invoiceId: string;
  maxAmount?: string;
  isSubmitting?: boolean;
  serverError?: string | null;
  onSubmit: (values: PaymentFormValues) => void | Promise<void>;
  onClose: () => void;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

const PaymentDialog = ({
  open,
  invoiceId: _invoiceId,
  maxAmount,
  isSubmitting = false,
  serverError,
  onSubmit,
  onClose,
}: PaymentDialogProps) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      paymentDate: todayIso(),
      amount: maxAmount ?? "",
      paymentMethod: "cash",
      referenceNumber: "",
      notes: "",
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Collect Payment</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {serverError && <Alert severity="error">{serverError}</Alert>}
          <TextField
            label="Payment Date"
            type="date"
            size="small"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            {...register("paymentDate")}
            error={Boolean(errors.paymentDate)}
            helperText={errors.paymentDate?.message}
          />
          <TextField
            label="Amount (₹)"
            size="small"
            fullWidth
            {...register("amount")}
            error={Boolean(errors.amount)}
            helperText={errors.amount?.message}
          />
          <Controller
            name="paymentMethod"
            control={control}
            render={({ field }) => (
              <TextField
                select
                label="Payment Method"
                size="small"
                fullWidth
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                inputRef={field.ref}
                error={Boolean(errors.paymentMethod)}
                helperText={errors.paymentMethod?.message}
              >
                {PAYMENT_METHOD_OPTIONS.map((method) => (
                  <MenuItem key={method} value={method}>
                    {PAYMENT_METHOD_LABELS[method]}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          <TextField
            label="Reference Number (optional)"
            size="small"
            fullWidth
            {...register("referenceNumber")}
            error={Boolean(errors.referenceNumber)}
            helperText={errors.referenceNumber?.message}
          />
          <TextField
            label="Notes (optional)"
            size="small"
            fullWidth
            multiline
            minRows={2}
            {...register("notes")}
            error={Boolean(errors.notes)}
            helperText={errors.notes?.message}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : undefined}
          onClick={() => void handleSubmit(onSubmit)()}
        >
          Record Payment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDialog;
