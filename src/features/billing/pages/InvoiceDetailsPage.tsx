import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import PaymentRoundedIcon from "@mui/icons-material/PaymentRounded";
import { useNavigate, useParams } from "react-router-dom";

import { extractApiErrorMessage } from "../../../lib/extractApiErrorMessage";
import { useAuth } from "../../auth";
import BillingSnackbar from "../components/BillingSnackbar";
import BillSummary from "../components/BillSummary";
import InvoiceDeleteDialog from "../components/InvoiceDeleteDialog";
import InvoiceDetailsSkeleton from "../components/InvoiceDetailsSkeleton";
import InvoicePrint from "../components/InvoicePrint";
import PaymentDialog from "../components/PaymentDialog";
import { useConsumeFlashMessage } from "../hooks/useConsumeFlashMessage";
import { useInvoiceMutations } from "../hooks/useInvoiceMutations";
import { useInvoice } from "../hooks/useInvoices";
import { usePaymentMutations } from "../hooks/usePaymentMutations";
import { useBillingSnackbar } from "../hooks/useBillingSnackbar";
import type { PaymentFormValues } from "../schemas/billingSchema";
import {
  BILLING_DEPARTMENT_LABELS,
  formatCurrency,
  formatDisplayDate,
  formatDisplayDateTime,
  getStatusChipColor,
  INVOICE_STATUS_LABELS,
  isTerminalStatus,
  PAYMENT_METHOD_LABELS,
  toPaymentPayload,
} from "../utils/billingUtils";

const InvoiceDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canUpdate = Boolean(user?.isSuperuser || user?.permissions.includes("billing:update"));
  const canDelete = Boolean(user?.isSuperuser || user?.permissions.includes("billing:delete"));

  const { data: invoice, isLoading, isError, refetch } = useInvoice(id);
  const { issue, remove } = useInvoiceMutations();
  const { create: createPayment } = usePaymentMutations();
  const { snackbar, showSuccess, showError, closeSnackbar } = useBillingSnackbar();

  const [pendingDelete, setPendingDelete] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useConsumeFlashMessage(showSuccess);

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
        Invoice not found, or the request failed. Please try again.
      </Alert>
    );
  }

  const handleIssue = async () => {
    if (!id) return;
    try {
      await issue.mutateAsync(id);
      showSuccess("Invoice issued successfully.");
    } catch (error) {
      showError(extractApiErrorMessage(error, "Could not issue invoice."));
    }
  };

  const handlePayment = async (values: PaymentFormValues) => {
    if (!id) return;
    setPaymentError(null);
    try {
      await createPayment.mutateAsync(toPaymentPayload(values, id));
      setPaymentOpen(false);
      showSuccess("Payment recorded successfully.");
    } catch (error) {
      setPaymentError(extractApiErrorMessage(error, "Could not record payment. Please try again."));
    }
  };

  const handleConfirmDelete = async () => {
    if (!id) return;
    try {
      await remove.mutateAsync(id);
      navigate("/billing/invoices", {
        replace: true,
        state: { flashMessage: `Invoice ${invoice.invoiceNumber} was deleted.` },
      });
    } catch {
      showError("Could not delete invoice. Please try again.");
      setPendingDelete(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate("/billing/invoices")}>
          Back to Invoices
        </Button>
        <Stack direction="row" spacing={1} sx={{ flex: 1, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <Chip label={INVOICE_STATUS_LABELS[invoice.status]} color={getStatusChipColor(invoice.status)} />
          {canUpdate && invoice.status === "draft" && (
            <Button
              variant="contained"
              startIcon={<SendRoundedIcon />}
              disabled={issue.isPending}
              onClick={() => void handleIssue()}
            >
              Issue Invoice
            </Button>
          )}
          {canUpdate && Number(invoice.balance) > 0 && !isTerminalStatus(invoice.status) && (
            <Button
              variant="outlined"
              startIcon={<PaymentRoundedIcon />}
              onClick={() => setPaymentOpen(true)}
            >
              Collect Payment
            </Button>
          )}
          {canDelete && !isTerminalStatus(invoice.status) && (
            <Button color="error" startIcon={<DeleteOutlineRoundedIcon />} onClick={() => setPendingDelete(true)}>
              Delete
            </Button>
          )}
        </Stack>
      </Stack>

      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Invoice {invoice.invoiceNumber}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {invoice.patientName ?? "Patient"}
          {invoice.consultationVisitNumber ? ` • Visit ${invoice.consultationVisitNumber}` : ""}
          {" • "}{formatDisplayDateTime(invoice.createdAt)}
        </Typography>
      </Box>

      <Card variant="outlined">
        <CardHeader title="Patient & Invoice Details" />
        <Divider />
        <CardContent>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
            <Stack spacing={0.5} sx={{ flex: 1 }}>
              <Typography variant="body2"><strong>Patient:</strong> {invoice.patientName ?? "—"}</Typography>
              {invoice.patientMrn && (
                <Typography variant="body2"><strong>MRN:</strong> {invoice.patientMrn}</Typography>
              )}
              {invoice.patientUhid && (
                <Typography variant="body2"><strong>UHID:</strong> {invoice.patientUhid}</Typography>
              )}
              {invoice.consultationVisitNumber && (
                <Typography variant="body2"><strong>Visit #:</strong> {invoice.consultationVisitNumber}</Typography>
              )}
            </Stack>
            <Stack spacing={0.5}>
              <Typography variant="body2"><strong>Status:</strong> {INVOICE_STATUS_LABELS[invoice.status]}</Typography>
              <Typography variant="body2"><strong>Invoice Date:</strong> {formatDisplayDate(invoice.invoiceDate)}</Typography>
              {invoice.notes && (
                <Typography variant="body2"><strong>Notes:</strong> {invoice.notes}</Typography>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardHeader title="Line Items" />
        <Divider />
        <CardContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Department</TableCell>
                <TableCell>Service</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell align="right">Unit Price</TableCell>
                <TableCell align="right">Discount</TableCell>
                <TableCell align="right">Tax</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoice.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{BILLING_DEPARTMENT_LABELS[item.department]}</TableCell>
                  <TableCell>{item.serviceName}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell align="right">{formatCurrency(item.discountAmount)}</TableCell>
                  <TableCell align="right">{formatCurrency(item.taxAmount)}</TableCell>
                  <TableCell align="right"><strong>{formatCurrency(item.totalAmount)}</strong></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Stack direction="row" sx={{ justifyContent: "flex-end", mt: 2 }}>
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

      {invoice.payments.length > 0 && (
        <Card variant="outlined">
          <CardHeader title="Payments" />
          <Divider />
          <CardContent>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Reference #</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{formatDisplayDate(payment.paymentDate)}</TableCell>
                    <TableCell>{PAYMENT_METHOD_LABELS[payment.paymentMethod]}</TableCell>
                    <TableCell>{payment.referenceNumber ?? "—"}</TableCell>
                    <TableCell align="right"><strong>{formatCurrency(payment.amount)}</strong></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <InvoicePrint invoice={invoice} />

      <PaymentDialog
        open={paymentOpen}
        invoiceId={invoice.id}
        maxAmount={invoice.balance}
        isSubmitting={createPayment.isPending}
        serverError={paymentError}
        onSubmit={handlePayment}
        onClose={() => {
          setPaymentOpen(false);
          setPaymentError(null);
        }}
      />

      <InvoiceDeleteDialog
        invoice={pendingDelete ? invoice : null}
        isDeleting={remove.isPending}
        onConfirm={() => void handleConfirmDelete()}
        onClose={() => setPendingDelete(false)}
      />
      <BillingSnackbar state={snackbar} onClose={closeSnackbar} />
    </Stack>
  );
};

export default InvoiceDetailsPage;
