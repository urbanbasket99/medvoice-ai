import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";

import {
  APPOINTMENT_PRIORITY_LABELS,
  APPOINTMENT_TYPE_LABELS,
  DEPARTMENT_LABELS,
} from "../schemas/appointmentSchema";
import AppointmentStatusChip from "./AppointmentStatusChip";
import { formatDisplayDate, formatDisplayTime } from "../utils/dateUtils";
import type { Appointment } from "../types/appointment.types";

export interface AppointmentCardProps {
  appointment: Appointment;
}

const AppointmentCard = ({ appointment }: AppointmentCardProps) => (
  <Card variant="outlined">
    <CardContent>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: { sm: "center" } }}>
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: 2,
            bgcolor: "primary.main",
            color: "primary.contrastText",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Typography variant="caption" sx={{ opacity: 0.85 }}>
            Token
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1 }}>
            {appointment.tokenNumber ?? "—"}
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", mb: 0.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {appointment.appointmentNumber}
            </Typography>
            <AppointmentStatusChip status={appointment.status} />
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {formatDisplayDate(appointment.appointmentDate)} at {formatDisplayTime(appointment.appointmentTime)} &bull;{" "}
            {appointment.durationMinutes} min
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            <Chip size="small" label={appointment.patientName ?? "Patient"} color="primary" variant="outlined" />
            <Chip size="small" label={appointment.doctorName ?? "Doctor"} variant="outlined" />
            <Chip size="small" label={DEPARTMENT_LABELS[appointment.department]} variant="outlined" />
            <Chip size="small" label={APPOINTMENT_TYPE_LABELS[appointment.appointmentType]} variant="outlined" />
            <Chip size="small" label={APPOINTMENT_PRIORITY_LABELS[appointment.priority]} variant="outlined" />
            {appointment.room && <Chip size="small" label={`Room ${appointment.room}`} variant="outlined" />}
          </Stack>
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

export default AppointmentCard;
