import { Box, Button, Divider, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";

import type { Invoice, Payment } from "../types/billing.types";
import { PAYMENT_METHOD_LABELS, formatCurrency, formatDisplayDateTime } from "../utils/billingUtils";

interface ReceiptPreviewProps {
  invoice: Invoice;
  payment: Payment;
}

const ReceiptPreview = ({ invoice, payment }: ReceiptPreviewProps) => {
  const handlePrint = () => window.print();

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: "flex-end", mb: 2 }}>
        <Button startIcon={<PrintRoundedIcon />} onClick={handlePrint} variant="outlined" size="small">
          Print Receipt
        </Button>
      </Stack>

      <Box
        id="receipt-print-area"
        sx={{
          p: 3,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          maxWidth: 480,
          mx: "auto",
        }}
      >
        <Stack spacing={2}>
          <Stack sx={{ alignItems: "center" }} spacing={0.5}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Payment Receipt
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Invoice #{invoice.invoiceNumber}
            </Typography>
          </Stack>

          <Divider />

          <Stack spacing={0.5}>
            <Typography variant="body2">
              <strong>Patient:</strong> {invoice.patientName ?? "—"}
            </Typography>
            {invoice.patientMrn && (
              <Typography variant="body2">
                <strong>MRN:</strong> {invoice.patientMrn}
              </Typography>
            )}
            {invoice.consultationVisitNumber && (
              <Typography variant="body2">
                <strong>Visit #:</strong> {invoice.consultationVisitNumber}
              </Typography>
            )}
          </Stack>

          <Divider />

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Field</TableCell>
                <TableCell align="right">Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Payment Date</TableCell>
                <TableCell align="right">{formatDisplayDateTime(payment.paymentDate)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Amount Paid</TableCell>
                <TableCell align="right"><strong>{formatCurrency(payment.amount)}</strong></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Method</TableCell>
                <TableCell align="right">{PAYMENT_METHOD_LABELS[payment.paymentMethod]}</TableCell>
              </TableRow>
              {payment.referenceNumber && (
                <TableRow>
                  <TableCell>Reference #</TableCell>
                  <TableCell align="right">{payment.referenceNumber}</TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell>Grand Total</TableCell>
                <TableCell align="right">{formatCurrency(invoice.grandTotal)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Balance Due</TableCell>
                <TableCell align="right">{formatCurrency(invoice.balance)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {payment.notes && (
            <Typography variant="caption" color="text.secondary">
              Notes: {payment.notes}
            </Typography>
          )}

          <Divider />
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center" }}>
            Thank you for your payment.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default ReceiptPreview;
