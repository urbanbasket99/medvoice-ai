import { Chip } from "@mui/material";

import type { DoctorStatus } from "../types/doctor.types";
import { DOCTOR_STATUS_LABELS } from "../schemas/doctorSchema";

export interface DoctorStatusChipProps {
  status: DoctorStatus;
}

const STATUS_COLOR: Record<DoctorStatus, "success" | "default" | "warning"> = {
  active: "success",
  inactive: "default",
  on_leave: "warning",
};

const DoctorStatusChip = ({ status }: DoctorStatusChipProps) => (
  <Chip
    size="small"
    label={DOCTOR_STATUS_LABELS[status]}
    color={STATUS_COLOR[status]}
    variant={status === "active" ? "filled" : "outlined"}
  />
);

export default DoctorStatusChip;
