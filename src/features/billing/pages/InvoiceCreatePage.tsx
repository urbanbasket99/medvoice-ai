import { useMemo, useState } from "react";
import { Alert, Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import { useNavigate, useSearchParams } from "react-router-dom";

import { extractApiErrorMessage } from "../../../lib/extractApiErrorMessage";
import { useInvoiceMutations } from "../hooks/useInvoiceMutations";
import { useConsultationCharges } from "../hooks/useInvoices";
import InvoiceForm from "../components/InvoiceForm";
import { invoiceFormDefaultValues, toCreatePayload } from "../utils/billingUtils";
import type { InvoiceFormValues } from "../schemas/billingSchema";

const InvoiceCreatePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const consultationId = searchParams.get("consultationId") ?? "";
  const { create } = useInvoiceMutations();
  const [serverError, setServerError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  const chargesQuery = useConsultationCharges(consultationId || undefined);

  const defaultValues = useMemo((): InvoiceFormValues => {
    const base = invoiceFormDefaultValues(consultationId);
    if (chargesQuery.data?.items?.length) {
      return {
        ...base,
        items: chargesQuery.data.items.map((item, idx) => ({
          serviceName: item.serviceName,
          department: item.department,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountAmount: item.discountAmount ?? "0",
          taxAmount: item.taxAmount ?? "0",
          sortOrder: idx,
          referenceType: item.referenceType ?? null,
          referenceId: item.referenceId ?? null,
        })),
      };
    }
    return base;
  }, [consultationId, chargesQuery.data]);

  const handleLoadCharges = () => {
    void chargesQuery.refetch();
    setFormKey((k) => k + 1);
  };

  const handleSubmit = async (values: InvoiceFormValues) => {
    setServerError(null);
    try {
      const invoice = await create.mutateAsync(toCreatePayload(values));
      navigate(`/billing/invoices/${invoice.id}`, {
        replace: true,
        state: { flashMessage: "Invoice created successfully." },
      });
    } catch (error) {
      setServerError(extractApiErrorMessage(error, "Could not create invoice. Please try again."));
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          New Invoice
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create a billing invoice for a patient or consultation.
        </Typography>
      </Box>

      {consultationId && (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Consultation: <strong>{consultationId}</strong>
          </Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={
              chargesQuery.isFetching ? (
                <CircularProgress size={14} />
              ) : (
                <DownloadRoundedIcon fontSize="small" />
              )
            }
            disabled={chargesQuery.isFetching}
            onClick={handleLoadCharges}
          >
            Load Charges
          </Button>
        </Stack>
      )}

      {serverError && <Alert severity="error">{serverError}</Alert>}

      <InvoiceForm
        key={formKey}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        submitLabel="Create Invoice"
        isSubmitting={create.isPending}
        showConsultationField={Boolean(consultationId)}
      />
    </Stack>
  );
};

export default InvoiceCreatePage;
