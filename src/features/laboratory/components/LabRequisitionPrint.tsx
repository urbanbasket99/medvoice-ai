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

import { useLabOrderPrint } from "../hooks/useLabOrder";
import {
  formatDisplayDate,
  PRIORITY_LABELS,
  SAMPLE_TYPE_LABELS,
  STATUS_LABELS,
} from "../utils/laboratoryUtils";
import type { SampleType } from "../types/laboratory.types";

export interface LabRequisitionPrintProps {
  labOrderId: string;
}

const LabRequisitionPrint = ({ labOrderId }: LabRequisitionPrintProps) => {
  const printQuery = useLabOrderPrint(labOrderId);

  const handlePrint = () => {
    window.print();
  };

  if (printQuery.isLoading) {
    return (
      <Stack spacing={2} sx={{ alignItems: "center", py: 4 }}>
        <CircularProgress size={32} />
        <Typography variant="body2" color="text.secondary">
          Loading requisition preview…
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
        Could not load requisition preview.
      </Alert>
    );
  }

  const data = printQuery.data;

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1.5} className="no-print" sx={{ flexWrap: "wrap" }}>
        <Button variant="contained" startIcon={<PrintRoundedIcon />} onClick={handlePrint}>
          Print Requisition
        </Button>
      </Stack>

      <Card variant="outlined" id="lab-requisition-print-area" sx={{ "@media print": { boxShadow: "none", border: 0 } }}>
        <CardContent>
          <Stack spacing={3}>
            <Stack spacing={0.5} sx={{ alignItems: "center", textAlign: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Laboratory Requisition
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
                <Typography variant="body2" color="text.secondary">
                  {data.patientGender ?? "—"}
                  {data.patientDateOfBirth ? ` • DOB ${formatDisplayDate(data.patientDateOfBirth)}` : ""}
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

            {data.clinicalNotes && (
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Clinical Notes
                </Typography>
                <Typography variant="body2">{data.clinicalNotes}</Typography>
              </Box>
            )}

            <Divider />

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Test</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Sample Type</TableCell>
                  <TableCell>Instructions</TableCell>
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
                      {item.instructions && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25 }}>
                          {item.instructions}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{item.category ?? "—"}</TableCell>
                    <TableCell>
                      {SAMPLE_TYPE_LABELS[item.sampleType as SampleType] ?? item.sampleType}
                    </TableCell>
                    <TableCell>{item.instructions ?? "—"}</TableCell>
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

export default LabRequisitionPrint;
