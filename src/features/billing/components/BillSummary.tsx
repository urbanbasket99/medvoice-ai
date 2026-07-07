import { Box, Divider, Stack, Typography } from "@mui/material";

import { formatCurrency } from "../utils/billingUtils";

interface BillSummaryProps {
  subtotal: string | number;
  discountAmount: string | number;
  taxAmount: string | number;
  grandTotal: string | number;
  paidAmount: string | number;
  balance: string | number;
}

const Row = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
  <Stack direction="row" sx={{ justifyContent: "space-between" }}>
    <Typography variant="body2" sx={{ fontWeight: bold ? 700 : 400, color: bold ? "text.primary" : "text.secondary" }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: bold ? 700 : 400 }}>
      {value}
    </Typography>
  </Stack>
);

const BillSummary = ({
  subtotal,
  discountAmount,
  taxAmount,
  grandTotal,
  paidAmount,
  balance,
}: BillSummaryProps) => {
  const balanceValue = Number(balance);
  return (
    <Box sx={{ minWidth: 240 }}>
      <Stack spacing={0.75}>
        <Row label="Subtotal" value={formatCurrency(subtotal)} />
        <Row label="Discount" value={`- ${formatCurrency(discountAmount)}`} />
        <Row label="Tax" value={formatCurrency(taxAmount)} />
        <Divider sx={{ my: 0.5 }} />
        <Row label="Grand Total" value={formatCurrency(grandTotal)} bold />
        <Row label="Paid" value={formatCurrency(paidAmount)} />
        <Row
          label="Balance Due"
          value={formatCurrency(balance)}
          bold={balanceValue > 0}
        />
      </Stack>
    </Box>
  );
};

export default BillSummary;
