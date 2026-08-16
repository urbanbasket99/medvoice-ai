import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import {
  AUDIT_ACTION_LABELS,
  formatAuditTimestamp,
  formatModuleLabel,
  getActionChipColor,
} from "../utils/auditUtils";
import type { AuditLog } from "../types/audit.types";

export interface AuditTimelineProps {
  logs: AuditLog[];
}

const AuditTimeline = ({ logs }: AuditTimelineProps) => {
  if (logs.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No related audit entries.
      </Typography>
    );
  }

  return (
    <Stack spacing={2}>
     {logs.map((log, index) => {
  const actionColor = getActionChipColor(log.action);

  return (
    <Stack key={log.id} direction="row" spacing={2}>
      <Box sx={{ width: 160, flexShrink: 0, pt: 1 }}>
        <Typography variant="caption" color="text.secondary" display="block">
          {formatAuditTimestamp(log.timestamp)}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: 16,
        }}
      >
  <Box
    sx={(theme) => ({
      width: 10,
      height: 10,
      borderRadius: "50%",
    bgcolor:
  actionColor === "default"
    ? theme.palette.grey[500]
    : theme.palette[
        actionColor as "error" | "info" | "success" | "warning"
      ].main,
    })}
  />
            {index < logs.length - 1 && (
              <Box sx={{ width: 2, flexGrow: 1, bgcolor: "divider", my: 0.5, minHeight: 24 }} />
            )}
          </Box>

          <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", alignItems: "center" }}>
                <Chip
                  size="small"
                  label={AUDIT_ACTION_LABELS[log.action]}
                  color={getActionChipColor(log.action)}
                />
                <Typography variant="subtitle2" fontWeight={600}>
                  {formatModuleLabel(log.module)} · {log.entity}
                </Typography>
              </Stack>
              <Typography variant="body2">{log.description}</Typography>
              <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
                {log.userName && (
                  <Typography variant="caption" color="text.secondary">
                    User: {log.userName}
                  </Typography>
                )}
                {log.requestId && (
                  <Typography variant="caption" color="text.secondary">
                    Request: {log.requestId}
                  </Typography>
                )}
              </Stack>
            </Stack>
          </Paper>
        </Stack>
        );
})}
    </Stack>
  );
};

export default AuditTimeline;
