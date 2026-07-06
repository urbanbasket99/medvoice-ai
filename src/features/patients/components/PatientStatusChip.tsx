import { Chip } from "@mui/material";

import type { PatientStatus } from "../types/patient.types";

export interface PatientStatusChipProps {
  status: PatientStatus;
}

const STATUS_LABEL: Record<PatientStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  deceased: "Deceased",
};

const STATUS_COLOR: Record<PatientStatus, "success" | "default" | "error"> = {
  active: "success",
  inactive: "default",
  deceased: "error",
};

const PatientStatusChip = ({ status }: PatientStatusChipProps) => (
  <Chip
    size="small"
    label={STATUS_LABEL[status]}
    color={STATUS_COLOR[status]}
    variant={status === "active" ? "filled" : "outlined"}
  />
);

export default PatientStatusChip;
