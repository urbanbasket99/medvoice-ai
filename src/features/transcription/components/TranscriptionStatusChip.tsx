import { Chip } from "@mui/material";

import type { TranscriptionStatus } from "../types/transcription.types";

const LABELS: Record<TranscriptionStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
};

const COLORS: Record<TranscriptionStatus, "default" | "primary" | "success" | "error" | "warning"> = {
  pending: "default",
  processing: "primary",
  completed: "success",
  failed: "error",
};

const TranscriptionStatusChip = ({ status }: { status: TranscriptionStatus }) => (
  <Chip
    size="small"
    label={LABELS[status] ?? status}
    color={COLORS[status] ?? "default"}
    variant={status === "pending" ? "outlined" : "filled"}
  />
);

export default TranscriptionStatusChip;
