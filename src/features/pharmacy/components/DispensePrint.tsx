import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
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

import { useDispensePrint } from "../hooks/useDispenses";
import { formatDisplayDate, formatPrice, STATUS_LABELS } from "../utils/pharmacyUtils";

export interface DispensePrintProps {
  dispenseId: string;
}

const DispensePrint = ({ dispenseId }: DispensePrintProps) => {
  const printQuery = useDispensePrint(dispenseId);

  const handlePrint = () => {
    window.print();
  };

  if (printQuery.isLoading) {
    return (
      <Stack spacing={2} sx={{ alignItems: "center", py: 4 }}>
        <CircularProgress size={32} />
        <Typography variant="body2" color="text.secondary">
          Loading dispense receipt…
        </Typography>
      </Stack>
    );
  }

  if (printQuery.isError || !printQuery.data) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => void printQuery.refetch()}>
            Retry
          </Button>
        }
      >
        Could not load dispense receipt.
      </Alert>
    );
  }

  const data = printQuery.data;

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1.5} className="no-print" sx={{ flexWrap: "wrap" }}>
        <Button variant="contained" startIcon={<PrintRoundedIcon />} onClick={handlePrint}>
          Print Receipt
        </Button>
      </Stack>

      <Card variant="outlined" id="dispense-print-area" sx={{ "@media print": { boxShadow: "none", border: 0 } }}>
        <CardContent>
          <Stack spacing={3}>
            <Stack spacing={0.5} sx={{ alignItems: "center", textAlign: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Pharmacy Dispense Receipt
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Order {data.orderNumber} • Visit {data.consultationVisitNumber ?? "—"} •{" "}
                {formatDisplayDate(data.dispensedAt ?? data.createdAt)}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ justifyContent: "center", flexWrap: "wrap" }}>
              <Chip size="small" label={STATUS_LABELS[data.status as keyof typeof STATUS_LABELS] ?? data.status} />
            </Stack>

            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              }}
            >
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Patient
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {data.patientName ?? "—"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  MRN: {data.patientMrn ?? "—"} • UHID: {data.patientUhid ?? "—"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Prescribing Doctor
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {data.doctorName ?? "—"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {data.doctorCode ?? "—"}
                </Typography>
              </Box>
            </Box>

            {data.notes && (
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Notes
                </Typography>
                <Typography variant="body2">{data.notes}</Typography>
              </Box>
            )}

            <Divider />

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Medicine</TableCell>
                  <TableCell>Qty</TableCell>
                  <TableCell>Batch</TableCell>
                  <TableCell>Expiry</TableCell>
                  <TableCell>Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.items.map((item, index) => (
                  <TableRow key={`${item.medicineName}-${index}`}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {item.medicineName}
                      </Typography>
                      {item.instructions && (
                        <Typography variant="caption" color="text.secondary">
                          {item.instructions}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.batchNumber ?? "—"}</TableCell>
                    <TableCell>{item.expiryDate ? formatDisplayDate(item.expiryDate) : "—"}</TableCell>
                    <TableCell>{formatPrice(item.unitPrice)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default DispensePrint;
