import { useState } from "react";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { useNavigate, useParams } from "react-router-dom";

import { extractApiErrorMessage } from "../../../lib/extractApiErrorMessage";
import BillSummary from "../components/BillSummary";
import InvoiceDetailsSkeleton from "../components/InvoiceDetailsSkeleton";
import ReceiptPreview from "../components/ReceiptPreview";
import { useInvoice } from "../hooks/useInvoices";
import { usePaymentMutations } from "../hooks/usePaymentMutations";
import type { PaymentFormValues } from "../schemas/billingSchema";
import { formatDisplayDateTime, getStatusChipColor, INVOICE_STATUS_LABELS, toPaymentPayload } from "../utils/billingUtils";
import { Chip, Card, CardContent, CardHeader, Divider, MenuItem, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentFormSchema } from "../schemas/billingSchema";
import { PAYMENT_METHOD_LABELS, PAYMENT_METHOD_OPTIONS } from "../utils/billingUtils";
import type { Payment } from "../types/billing.types";

const todayIso = () => new Date().toISOString().slice(0, 10);

const PaymentPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: invoice, isLoading, isError, refetch } = useInvoice(id);
  const { create: createPayment } = usePaymentMutations();
  const [serverError, setServerError] = useState<string | null>(null);
  const [completedPayment, setCompletedPayment] = useState<Payment | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      paymentDate: todayIso(),
      amount: "",
      paymentMethod: "cash",
      referenceNumber: "",
      notes: "",
    },
  });

  if (isLoading) return <InvoiceDetailsSkeleton />;

  if (isError || !invoice) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => void refetch()}>
            Retry
          </Button>
        }
      >
        Invoice not found. Please try again.
      </Alert>
    );
  }

  const handlePaymentSubmit = async (values: PaymentFormValues) => {
    if (!id) return;
    setServerError(null);
    try {
      const payment = await createPayment.mutateAsync(toPaymentPayload(values, id));
      setCompletedPayment(payment);
    } catch (error) {
      setServerError(extractApiErrorMessage(error, "Could not record payment. Please try again."));
    }
  };

  if (completedPayment) {
    return (
      <Stack spacing={3}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate(`/billing/invoices/${invoice.id}`)}>
            Back to Invoice
          </Button>
        </Stack>
        <Alert severity="success">Payment of ₹{completedPayment.amount} recorded successfully.</Alert>
        <ReceiptPreview invoice={invoice} payment={completedPayment} />
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate(`/billing/invoices/${invoice.id}`)}>
          Back to Invoice {invoice.invoiceNumber}
        </Button>
        <Chip label={INVOICE_STATUS_LABELS[invoice.status]} color={getStatusChipColor(invoice.status)} sx={{ ml: 1 }} />
      </Stack>

      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Collect Payment
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {invoice.patientName ?? "Patient"} • {formatDisplayDateTime(invoice.createdAt)}
        </Typography>
      </Box>

      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
            <BillSummary
              subtotal={invoice.subtotal}
              discountAmount={invoice.discountAmount}
              taxAmount={invoice.taxAmount}
              grandTotal={invoice.grandTotal}
              paidAmount={invoice.paidAmount}
              balance={invoice.balance}
            />
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardHeader title="Payment Details" />
        <Divider />
        <CardContent>
          <Stack
            component="form"
            spacing={2}
            onSubmit={handleSubmit(handlePaymentSubmit)}
            noValidate
          >
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
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button type="submit" variant="contained" disabled={createPayment.isPending}>
                {createPayment.isPending ? "Recording…" : "Record Payment"}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default PaymentPage;
