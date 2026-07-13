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

import { useLabResultsPrint } from "../hooks/useLabOrders";
import {
  formatDisplayDate,
  PRIORITY_LABELS,
  SAMPLE_TYPE_LABELS,
  STATUS_LABELS,
} from "../utils/laboratoryUtils";
import type { SampleType } from "../types/laboratory.types";

export interface LabResultsPrintProps {
  labOrderId: string;
}

const LabResultsPrint = ({ labOrderId }: LabResultsPrintProps) => {
  const printQuery = useLabResultsPrint(labOrderId);

  const handlePrint = () => {
    window.print();
  };

  if (printQuery.isLoading) {
    return (
      <Stack spacing={2} sx={{ alignItems: "center", py: 4 }}>
        <CircularProgress size={32} />
        <Typography variant="body2" color="text.secondary">
          Loading results preview…
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
        Could not load results preview.
      </Alert>
    );
  }

  const data = printQuery.data;

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1.5} className="no-print" sx={{ flexWrap: "wrap" }}>
        <Button variant="contained" startIcon={<PrintRoundedIcon />} onClick={handlePrint}>
          Print Results
        </Button>
      </Stack>

      <Card variant="outlined" id="lab-results-print-area" sx={{ "@media print": { boxShadow: "none", border: 0 } }}>
        <CardContent>
          <Stack spacing={3}>
            <Stack spacing={0.5} sx={{ alignItems: "center", textAlign: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Laboratory Results
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Order {data.orderNumber} • Visit {data.consultationVisitNumber ?? "—"} •{" "}
                {formatDisplayDate(data.createdAt.slice(0, 10))}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ justifyContent: "center", flexWrap: "wrap" }}>
              <Chip size="small" label={PRIORITY_LABELS[data.priority as keyof typeof PRIORITY_LABELS] ?? data.priority} />
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
                  Ordering Doctor
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {data.doctorName ?? "—"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {data.doctorCode ?? "—"}
                  {data.doctorSpecialization ? ` • ${data.doctorSpecialization}` : ""}
                </Typography>
              </Box>
            </Box>

            <Divider />

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Test</TableCell>
                  <TableCell>Result</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell>Flag</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.items.map((item, index) => (
                  <TableRow key={`${item.labTestName}-${index}`}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {item.labTestName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {SAMPLE_TYPE_LABELS[item.sampleType as SampleType] ?? item.sampleType}
                      </Typography>
                    </TableCell>
                    <TableCell>{item.resultValue ?? "—"}</TableCell>
                    <TableCell>{item.resultUnit ?? "—"}</TableCell>
                    <TableCell>{item.referenceRange ?? "—"}</TableCell>
                    <TableCell>{item.resultFlag ?? "—"}</TableCell>
                    <TableCell>{item.resultNotes ?? "—"}</TableCell>
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

export default LabResultsPrint;
