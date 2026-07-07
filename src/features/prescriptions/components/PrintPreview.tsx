import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";

import { extractApiErrorMessage } from "../../../lib/extractApiErrorMessage";
import { useExportPrescriptionPdf } from "../hooks/useCreatePrescription";
import { usePrescriptionPrint } from "../hooks/usePrescription";
import { formatDisplayDate } from "../utils/prescriptionUtils";

export interface PrintPreviewProps {
  prescriptionId: string;
}

const PrintPreview = ({ prescriptionId }: PrintPreviewProps) => {
  const printQuery = usePrescriptionPrint(prescriptionId);
  const exportPdf = useExportPrescriptionPdf();
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = async () => {
    setExportMessage(null);
    try {
      const result = await exportPdf.mutateAsync(prescriptionId);
      setExportMessage(result.message);
    } catch (error) {
      setExportMessage(extractApiErrorMessage(error, "PDF export failed."));
    }
  };

  if (printQuery.isLoading) {
    return (
      <Stack spacing={2} sx={{ alignItems: "center", py: 4 }}>
        <CircularProgress size={32} />
        <Typography variant="body2" color="text.secondary">
          Loading print preview…
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
        Could not load print preview.
      </Alert>
    );
  }

  const data = printQuery.data;

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1.5} className="no-print" sx={{ flexWrap: "wrap" }}>
        <Button variant="contained" startIcon={<PrintRoundedIcon />} onClick={handlePrint}>
          Print
        </Button>
        <Button
          variant="outlined"
          startIcon={exportPdf.isPending ? <CircularProgress size={18} /> : <PictureAsPdfRoundedIcon />}
          disabled={exportPdf.isPending}
          onClick={() => void handleExportPdf()}
        >
          Export PDF
        </Button>
      </Stack>

      {exportMessage && (
        <Alert severity="info" className="no-print">
          {exportMessage}
        </Alert>
      )}

      <Card variant="outlined" id="prescription-print-area" sx={{ "@media print": { boxShadow: "none", border: 0 } }}>
        <CardContent>
          <Stack spacing={3}>
            <Stack spacing={0.5} sx={{ alignItems: "center", textAlign: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Prescription
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Visit {data.consultationVisitNumber ?? "—"} • {formatDisplayDate(data.createdAt.slice(0, 10))}
              </Typography>
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
                  Doctor
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

            {data.diagnosis && (
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Diagnosis
                </Typography>
                <Typography variant="body2">{data.diagnosis}</Typography>
              </Box>
            )}

            <Divider />

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Medicine</TableCell>
                  <TableCell>Dosage</TableCell>
                  <TableCell>Frequency</TableCell>
                  <TableCell>Route</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Qty</TableCell>
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
                      {item.strength && (
                        <Typography variant="caption" color="text.secondary">
                          {item.strength}
                        </Typography>
                      )}
                      {item.dosageSummary && (
                        <Typography variant="caption" sx={{ display: "block" }} color="text.secondary">
                          {item.dosageSummary}
                        </Typography>
                      )}
                      {item.instructions && (
                        <Typography variant="caption" sx={{ display: "block" }}>
                          {item.instructions}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{item.dosage ?? "—"}</TableCell>
                    <TableCell>{item.frequency}</TableCell>
                    <TableCell>{item.route}</TableCell>
                    <TableCell>{item.duration ?? "—"}</TableCell>
                    <TableCell>{item.quantity ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {data.advice && (
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Advice
                </Typography>
                <Typography variant="body2">{data.advice}</Typography>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default PrintPreview;
