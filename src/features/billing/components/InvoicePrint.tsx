import {
  Box,
  Button,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";

import type { Invoice } from "../types/billing.types";
import {
  BILLING_DEPARTMENT_LABELS,
  INVOICE_STATUS_LABELS,
  formatCurrency,
  formatDisplayDate,
} from "../utils/billingUtils";

interface InvoicePrintProps {
  invoice: Invoice;
}

const InvoicePrint = ({ invoice }: InvoicePrintProps) => {
  const handlePrint = () => window.print();

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: "flex-end", mb: 2 }}>
        <Button startIcon={<PrintRoundedIcon />} onClick={handlePrint} variant="outlined" size="small">
          Print Invoice
        </Button>
      </Stack>

      <Box
        id="invoice-print-area"
        sx={{
          p: 3,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
        }}
      >
        <Stack spacing={3}>
          <Stack direction={{ xs: "column", sm: "row" }} sx={{ justifyContent: "space-between", alignItems: "flex-start" }} spacing={2}>
            <Stack spacing={0.5}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Invoice
              </Typography>
              <Typography variant="body2" color="text.secondary">
                #{invoice.invoiceNumber}
              </Typography>
            </Stack>
            <Stack spacing={0.5} sx={{ textAlign: { sm: "right" } }}>
              <Typography variant="body2">
                <strong>Status:</strong> {INVOICE_STATUS_LABELS[invoice.status]}
              </Typography>
              <Typography variant="body2">
                <strong>Invoice Date:</strong> {formatDisplayDate(invoice.invoiceDate)}
              </Typography>
            </Stack>
          </Stack>

          <Divider />

          <Stack spacing={0.5}>
            <Typography variant="subtitle2">Bill To</Typography>
            <Typography variant="body2">{invoice.patientName ?? "—"}</Typography>
            {invoice.patientMrn && (
              <Typography variant="body2" color="text.secondary">
                MRN: {invoice.patientMrn}
              </Typography>
            )}
            {invoice.patientUhid && (
              <Typography variant="body2" color="text.secondary">
                UHID: {invoice.patientUhid}
              </Typography>
            )}
            {invoice.consultationVisitNumber && (
              <Typography variant="body2" color="text.secondary">
                Visit #: {invoice.consultationVisitNumber}
              </Typography>
            )}
          </Stack>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
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
              {invoice.items.map((item, idx) => (
                <TableRow key={item.id}>
                  <TableCell>{idx + 1}</TableCell>
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

          <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
            <Stack spacing={0.5} sx={{ minWidth: 220 }}>
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                <Typography variant="body2">{formatCurrency(invoice.subtotal)}</Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Discount</Typography>
                <Typography variant="body2">- {formatCurrency(invoice.discountAmount)}</Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Tax</Typography>
                <Typography variant="body2">{formatCurrency(invoice.taxAmount)}</Typography>
              </Stack>
              <Divider />
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Grand Total</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatCurrency(invoice.grandTotal)}</Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Paid</Typography>
                <Typography variant="body2">{formatCurrency(invoice.paidAmount)}</Typography>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: Number(invoice.balance) > 0 ? "error.main" : "success.main" }}>Balance Due</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: Number(invoice.balance) > 0 ? "error.main" : "success.main" }}>
                  {formatCurrency(invoice.balance)}
                </Typography>
              </Stack>
            </Stack>
          </Stack>

          {invoice.notes && (
            <>
              <Divider />
              <Typography variant="body2" color="text.secondary">
                <strong>Notes:</strong> {invoice.notes}
              </Typography>
            </>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default InvoicePrint;
