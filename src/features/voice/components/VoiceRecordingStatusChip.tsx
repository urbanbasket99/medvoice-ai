import { Chip } from "@mui/material";

import type { RecordingStatus } from "../types/voice.types";

const STATUS_LABELS: Record<RecordingStatus, string> = {
  recording: "Recording",
  stopped: "Stopped",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
};

const STATUS_COLORS: Record<RecordingStatus, "default" | "primary" | "success" | "warning" | "error" | "info"> = {
  recording: "error",
  stopped: "warning",
  completed: "success",
  failed: "error",
  cancelled: "default",
};

const VoiceRecordingStatusChip = ({ status }: { status: RecordingStatus }) => (
  <Chip size="small" label={STATUS_LABELS[status]} color={STATUS_COLORS[status]} variant={status === "cancelled" ? "outlined" : "filled"} />
);

export default VoiceRecordingStatusChip;
