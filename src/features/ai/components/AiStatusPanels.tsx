import { Alert, Stack, Typography } from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";

import AiHealthStatus from "./AiHealthStatus";
import type { AiHealth } from "../types/ai.types";

const ApiKeyStatus = ({ configured }: { configured: boolean }) => (
  <Alert
    severity={configured ? "success" : "warning"}
    icon={configured ? <CheckCircleRoundedIcon /> : <ErrorOutlineRoundedIcon />}
  >
    {configured
      ? "API key is configured on the server (OPENAI_API_KEY)."
      : "API key is not configured. Set OPENAI_API_KEY in the backend environment."}
  </Alert>
);

const HealthStatusPanel = ({ health, isLoading }: { health?: AiHealth; isLoading?: boolean }) => (
  <Stack spacing={1}>
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography variant="subtitle2">Provider Health</Typography>
      {health && <AiHealthStatus status={health.status} />}
    </Stack>
    {isLoading && (
      <Typography variant="body2" color="text.secondary">
        Checking provider health…
      </Typography>
    )}
    {health && (
      <>
        <Typography variant="body2" color="text.secondary">
          {health.message}
        </Typography>
        {health.latencyMs != null && (
          <Typography variant="caption" color="text.secondary">
            Latency: {health.latencyMs.toFixed(0)} ms · Checked {new Date(health.checkedAt).toLocaleString()}
          </Typography>
        )}
      </>
    )}
  </Stack>
);

export { ApiKeyStatus, HealthStatusPanel };
