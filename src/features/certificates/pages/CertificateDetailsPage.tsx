import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { useNavigate, useParams } from "react-router-dom";

import CertificatePrint from "../components/CertificatePrint";
import { useCertificate } from "../hooks/useCertificates";
import { CERTIFICATE_TYPE_LABELS, formatDisplayDate } from "../utils/certificateUtils";

const CertificateDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: certificate, isLoading, isError, refetch } = useCertificate(id);

  if (isLoading) {
    return <Typography variant="body2">Loading certificate…</Typography>;
  }

  if (isError || !certificate) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => void refetch()}>
            Retry
          </Button>
        }
      >
        Certificate not found, or the request failed.
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate("/certificates")}>
          Back to Certificates
        </Button>
      </Stack>

      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {certificate.certificateNumber}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {CERTIFICATE_TYPE_LABELS[certificate.certificateType]} • {formatDisplayDate(certificate.issueDate)}
        </Typography>
      </Box>

      <Card variant="outlined">
        <CardHeader title="Details" />
        <Divider />
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="body2">
              <strong>Patient:</strong> {certificate.patientName ?? "—"} ({certificate.patientUhid ?? "—"})
            </Typography>
            <Typography variant="body2">
              <strong>Doctor:</strong> {certificate.doctorName ?? "—"}
            </Typography>
            <Typography variant="body2">
              <strong>Valid:</strong> {formatDisplayDate(certificate.validFrom)} –{" "}
              {formatDisplayDate(certificate.validTo)}
            </Typography>
            <Typography variant="body2">
              <strong>Fitness status:</strong> {certificate.fitnessStatus ?? "—"}
            </Typography>
            <Typography variant="body2">
              <strong>Rest days:</strong> {certificate.restDays ?? "—"}
            </Typography>
            {certificate.diagnosis && (
              <Typography variant="body2">
                <strong>Diagnosis:</strong> {certificate.diagnosis}
              </Typography>
            )}
            {certificate.remarks && (
              <Typography variant="body2">
                <strong>Remarks:</strong> {certificate.remarks}
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>

      <CertificatePrint certificateId={certificate.id} />
    </Stack>
  );
};

export default CertificateDetailsPage;
