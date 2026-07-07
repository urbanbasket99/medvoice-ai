import { Chip } from "@mui/material";

import type { HealthStatus } from "../types/ai.types";

const LABELS: Record<HealthStatus, string> = {
  healthy: "Healthy",
  degraded: "Degraded",
  unhealthy: "Unhealthy",
  not_configured: "Not Configured",
};

const COLORS: Record<HealthStatus, "success" | "warning" | "error" | "default"> = {
  healthy: "success",
  degraded: "warning",
  unhealthy: "error",
  not_configured: "default",
};

const AiHealthStatus = ({ status }: { status: HealthStatus }) => (
  <Chip size="small" label={LABELS[status]} color={COLORS[status]} variant={status === "not_configured" ? "outlined" : "filled"} />
);

export default AiHealthStatus;
