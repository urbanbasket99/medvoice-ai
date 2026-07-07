import { Alert, Box, Button, Card, CardContent, CardHeader, CircularProgress, Divider, Stack, TextField } from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { invoiceFormSchema, type InvoiceFormValues } from "../schemas/billingSchema";
import InvoiceItemEditor from "./InvoiceItemEditor";
import BillSummary from "./BillSummary";
import { computeTotalsFromItems } from "../utils/billingUtils";

interface InvoiceFormProps {
  defaultValues: InvoiceFormValues;
  onSubmit: (values: InvoiceFormValues) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  serverError?: string | null;
  readOnly?: boolean;
  showConsultationField?: boolean;
}

const InvoiceForm = ({
  defaultValues,
  onSubmit,
  submitLabel = "Save Invoice",
  isSubmitting = false,
  serverError,
  readOnly = false,
  showConsultationField = false,
}: InvoiceFormProps) => {
  const methods = useForm<InvoiceFormValues>({
    defaultValues,
    resolver: zodResolver(invoiceFormSchema),
  });

  const { register, handleSubmit, formState: { errors }, watch } = methods;
  const items = watch("items");
  const invoiceDiscount = watch("discountAmount");
  const invoiceTax = watch("taxAmount");
  const totals = computeTotalsFromItems(items ?? [], invoiceDiscount, invoiceTax);

  return (
    <FormProvider {...methods}>
      <Stack component="form" spacing={3} onSubmit={handleSubmit(onSubmit)} noValidate>
        {serverError && <Alert severity="error">{serverError}</Alert>}

        <Card variant="outlined">
          <CardHeader title="Invoice Details" />
          <Divider />
          <CardContent>
            <Stack spacing={2}>
              {showConsultationField && (
                <TextField
                  label="Consultation ID"
                  size="small"
                  fullWidth
                  disabled={readOnly}
                  {...register("consultationId")}
                  error={Boolean(errors.consultationId)}
                  helperText={errors.consultationId?.message}
                />
              )}
              <TextField
                label="Invoice Date"
                size="small"
                type="date"
                fullWidth
                disabled={readOnly}
                slotProps={{ inputLabel: { shrink: true } }}
                {...register("invoiceDate")}
                error={Boolean(errors.invoiceDate)}
                helperText={errors.invoiceDate?.message}
              />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <TextField
                  label="Invoice Discount (₹)"
                  size="small"
                  fullWidth
                  disabled={readOnly}
                  {...register("discountAmount")}
                />
                <TextField
                  label="Invoice Tax (₹)"
                  size="small"
                  fullWidth
                  disabled={readOnly}
                  {...register("taxAmount")}
                />
              </Stack>
              <TextField
                label="Notes"
                size="small"
                fullWidth
                multiline
                minRows={2}
                disabled={readOnly}
                {...register("notes")}
                error={Boolean(errors.notes)}
                helperText={errors.notes?.message}
              />
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardHeader title="Line Items" />
          <Divider />
          <CardContent>
            <InvoiceItemEditor readOnly={readOnly} />
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
              <BillSummary
                subtotal={String(totals.subtotal)}
                discountAmount={String(totals.discountTotal)}
                taxAmount={String(totals.taxTotal)}
                grandTotal={String(totals.grandTotal)}
                paidAmount="0"
                balance={String(totals.grandTotal)}
              />
            </Stack>
          </CardContent>
        </Card>

        {!readOnly && (
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : undefined}
            >
              {submitLabel}
            </Button>
          </Box>
        )}
      </Stack>
    </FormProvider>
  );
};

export default InvoiceForm;
