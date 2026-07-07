import { Chip } from "@mui/material";

import { CONSULTATION_STATUS_LABELS, STATUS_COLORS } from "../schemas/consultationSchema";
import type { ConsultationStatus } from "../types/consultation.types";

const ConsultationStatusChip = ({ status }: { status: ConsultationStatus }) => (
  <Chip
    size="small"
    label={CONSULTATION_STATUS_LABELS[status]}
    color={STATUS_COLORS[status]}
    variant={status === "completed" ? "filled" : "outlined"}
  />
);

export default ConsultationStatusChip;
