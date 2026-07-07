import { Avatar, Box, Card, CardContent, CardHeader, Divider, Stack, Typography } from "@mui/material";
import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";
import MonitorHeartRoundedIcon from "@mui/icons-material/MonitorHeartRounded";

import { GENDER_LABELS } from "../schemas/consultationSchema";
import ConsultationStatusChip from "./ConsultationStatusChip";
import { calculateAge, formatDisplayDate, formatDisplayTime } from "../utils/consultationUtils";
import type { Consultation } from "../types/consultation.types";

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <Box>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2">{value}</Typography>
  </Box>
);

const ConsultationPatientSummary = ({ consultation }: { consultation: Consultation }) => {
  const age = calculateAge(consultation.patientDateOfBirth);
  const vitals = consultation.vitalSigns;

  return (
    <Card variant="outlined" sx={{ position: { lg: "sticky" }, top: { lg: 88 } }}>
      <CardHeader title="Patient Summary" subheader={consultation.visitNumber} />
      <Divider />
      <CardContent>
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <Avatar sx={{ width: 72, height: 72, bgcolor: "primary.main", fontSize: 28 }}>
              {consultation.patientName?.charAt(0) ?? "P"}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {consultation.patientName ?? "Patient"}
              </Typography>
              <ConsultationStatusChip status={consultation.status} />
            </Box>
          </Stack>

          <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: "1fr 1fr" }}>
            <SummaryRow label="Age" value={age != null ? `${age} yrs` : "—"} />
            <SummaryRow label="Gender" value={GENDER_LABELS[consultation.patientGender ?? ""] ?? consultation.patientGender ?? "—"} />
            <SummaryRow label="MRN" value={consultation.patientMrn ?? "—"} />
            <SummaryRow label="UHID" value={consultation.patientUhid ?? "—"} />
          </Box>

          <Divider />

          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <LocalHospitalRoundedIcon fontSize="small" color="action" />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Attending Doctor
              </Typography>
              <Typography variant="body2">
                {consultation.doctorName ?? "—"} ({consultation.doctorCode ?? "—"})
              </Typography>
            </Box>
          </Stack>

          <SummaryRow
            label="Appointment"
            value={`${consultation.appointmentNumber ?? "—"} • ${formatDisplayDate(consultation.appointmentDate)} at ${formatDisplayTime(consultation.appointmentTime)}`}
          />

          <Divider />

          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <MonitorHeartRoundedIcon fontSize="small" color="action" />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Vitals
            </Typography>
          </Stack>

          <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: "1fr 1fr" }}>
            <SummaryRow
              label="Blood Pressure"
              value={
                vitals?.bloodPressureSystolic && vitals?.bloodPressureDiastolic
                  ? `${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic} mmHg`
                  : "—"
              }
            />
            <SummaryRow label="Pulse" value={vitals?.pulse != null ? `${vitals.pulse} bpm` : "—"} />
            <SummaryRow label="Temperature" value={vitals?.temperature != null ? `${vitals.temperature} °C` : "—"} />
            <SummaryRow label="SpO₂" value={vitals?.spo2 != null ? `${vitals.spo2}%` : "—"} />
            <SummaryRow label="Resp. Rate" value={vitals?.respiratoryRate != null ? `${vitals.respiratoryRate}/min` : "—"} />
            <SummaryRow label="Weight" value={vitals?.weightKg != null ? `${vitals.weightKg} kg` : "—"} />
          </Box>

          <Divider />

          <SummaryRow label="Allergies" value={consultation.allergies?.trim() || "None recorded"} />
          <SummaryRow label="Current Medications" value={consultation.currentMedications?.trim() || "None recorded"} />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ConsultationPatientSummary;
