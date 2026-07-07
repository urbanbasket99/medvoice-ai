import { Chip } from "@mui/material";

import { APPOINTMENT_STATUS_LABELS, STATUS_COLORS } from "../schemas/appointmentSchema";
import type { AppointmentStatus } from "../types/appointment.types";

const AppointmentStatusChip = ({ status }: { status: AppointmentStatus }) => (
  <Chip
    size="small"
    label={APPOINTMENT_STATUS_LABELS[status]}
    color={STATUS_COLORS[status]}
    variant={status === "completed" ? "filled" : "outlined"}
  />
);

export default AppointmentStatusChip;
