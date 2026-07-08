import { useMemo } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import { useNavigate, useParams } from "react-router-dom";

import AuditTimeline from "../components/AuditTimeline";
import { useAuditLog, useAuditLogs } from "../hooks/useAuditLogs";
import {
  AUDIT_ACTION_LABELS,
  formatAuditTimestamp,
  formatModuleLabel,
  getActionChipColor,
} from "../utils/auditUtils";

const JsonBlock = ({ label, value }: { label: string; value: Record<string, unknown> | null }) => (
  <Box>
    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
      {label}
    </Typography>
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        bgcolor: (theme) => theme.surfaces.sunken,
        fontFamily: "monospace",
        fontSize: 12,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      {value ? JSON.stringify(value, null, 2) : "—"}
    </Paper>
  </Box>
);

const AuditLogDetailsPage = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data: log, isLoading, isError, refetch } = useAuditLog(id);

  const relatedParams = useMemo(
    () => ({
      page: 1,
      pageSize: 5,
      module: log?.module,
      entityId: log?.entityId ?? undefined,
    }),
    [log?.module, log?.entityId],
  );

  const relatedQuery = useAuditLogs(relatedParams);
  const relatedLogs = (relatedQuery.data?.items ?? []).filter((entry) => entry.id !== id);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !log) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => void refetch()}>
            Retry
          </Button>
        }
      >
        Audit log entry could not be loaded.
      </Alert>
    );
  }

  return (
    <Box id="audit-print-area">
      <Stack spacing={3} className="no-print">
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
          <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate("/audit/logs")}>
            Back to Audit Logs
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="outlined" startIcon={<PrintRoundedIcon />} onClick={() => window.print()}>
            Print
          </Button>
        </Stack>
      </Stack>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", alignItems: "center" }}>
            <Chip
              size="small"
              label={AUDIT_ACTION_LABELS[log.action]}
              color={getActionChipColor(log.action)}
            />
            <Typography variant="h5" fontWeight={700}>
              {formatModuleLabel(log.module)} · {log.entity}
            </Typography>
          </Stack>

          <Typography variant="body1">{log.description}</Typography>

          <Divider />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                Timestamp
              </Typography>
              <Typography variant="body2">{formatAuditTimestamp(log.timestamp)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                User
              </Typography>
              <Typography variant="body2">{log.userName ?? "—"}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Role
              </Typography>
              <Typography variant="body2">{log.role ?? "—"}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Entity ID
              </Typography>
              <Typography variant="body2">{log.entityId ?? "—"}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                IP Address
              </Typography>
              <Typography variant="body2">{log.ipAddress ?? "—"}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Request ID
              </Typography>
              <Typography variant="body2">{log.requestId ?? "—"}</Typography>
            </Box>
            <Box sx={{ gridColumn: { md: "1 / -1" } }}>
              <Typography variant="caption" color="text.secondary">
                User Agent
              </Typography>
              <Typography variant="body2">{log.userAgent ?? "—"}</Typography>
            </Box>
          </Box>

          <Divider />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2,
            }}
          >
            <JsonBlock label="Old Value" value={log.oldValue} />
            <JsonBlock label="New Value" value={log.newValue} />
          </Box>
        </Stack>
      </Paper>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Related Activity
        </Typography>
        <AuditTimeline logs={relatedLogs} />
      </Box>
    </Box>
  );
};

export default AuditLogDetailsPage;
