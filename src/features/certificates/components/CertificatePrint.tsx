import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";

import { useCertificatePrint } from "../hooks/useCertificates";
import { CERTIFICATE_TYPE_LABELS, formatDisplayDate } from "../utils/certificateUtils";
import type { CertificateType } from "../types/certificate.types";

interface CertificatePrintProps {
  certificateId: string;
}

const CertificatePrint = ({ certificateId }: CertificatePrintProps) => {
  const printQuery = useCertificatePrint(certificateId);

  if (printQuery.isLoading) {
    return (
      <Stack spacing={2} sx={{ alignItems: "center", py: 4 }}>
        <CircularProgress size={32} />
        <Typography variant="body2" color="text.secondary">
          Loading certificate preview…
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
        Could not load certificate preview.
      </Alert>
    );
  }

  const data = printQuery.data;
  const typeLabel =
    CERTIFICATE_TYPE_LABELS[data.certificateType as CertificateType] ?? data.certificateType;

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1.5} className="no-print">
        <Button variant="contained" startIcon={<PrintRoundedIcon />} onClick={() => window.print()}>
          Print Certificate
        </Button>
      </Stack>

      <Card variant="outlined" id="certificate-print-area" sx={{ "@media print": { boxShadow: "none", border: 0 } }}>
        <CardContent>
          <Stack spacing={3}>
            <Stack spacing={0.5} sx={{ alignItems: "center", textAlign: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Medical Certificate
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {data.certificateNumber} • {typeLabel} • {formatDisplayDate(data.issueDate)}
              </Typography>
            </Stack>

            <Divider />

            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Patient
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {data.patientName ?? "—"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  MRN {data.patientMrn ?? "—"} • UHID {data.patientUhid ?? "—"}
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

            <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
              <Typography variant="body2">
                <strong>Valid from:</strong> {formatDisplayDate(data.validFrom)}
              </Typography>
              <Typography variant="body2">
                <strong>Valid to:</strong> {formatDisplayDate(data.validTo)}
              </Typography>
              <Typography variant="body2">
                <strong>Fitness status:</strong> {data.fitnessStatus ?? "—"}
              </Typography>
              <Typography variant="body2">
                <strong>Rest days:</strong> {data.restDays ?? "—"}
              </Typography>
            </Box>

            {data.diagnosis && (
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Diagnosis
                </Typography>
                <Typography variant="body2">{data.diagnosis}</Typography>
              </Box>
            )}

            {data.remarks && (
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Remarks
                </Typography>
                <Typography variant="body2">{data.remarks}</Typography>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default CertificatePrint;
