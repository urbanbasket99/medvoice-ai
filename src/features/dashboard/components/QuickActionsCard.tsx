import type { ReactElement } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import MicRoundedIcon from "@mui/icons-material/MicRounded";
import PersonSearchRoundedIcon from "@mui/icons-material/PersonSearchRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import SummarizeRoundedIcon from "@mui/icons-material/SummarizeRounded";

import { useQuickActions } from "../hooks/useDashboardData";
import type { QuickActionIconKey } from "../types/dashboard.types";

const ICONS: Record<QuickActionIconKey, ReactElement> = {
  consultation: <MicRoundedIcon fontSize="small" />,
  search: <PersonSearchRoundedIcon fontSize="small" />,
  schedule: <CalendarMonthRoundedIcon fontSize="small" />,
  report: <SummarizeRoundedIcon fontSize="small" />,
};

const QuickActionsCard = () => {
  const { data: actions, isLoading, error } = useQuickActions();

  return (
    <Card sx={{ height: "100%" }}>
      <CardHeader title="Quick Actions" subheader="Available once each module ships" />
      <Divider />
      <CardContent>
        {error && <Alert severity="error">{error}</Alert>}

        {!error && (isLoading || !actions) && (
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "repeat(2, 1fr)" }}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} variant="rounded" height={88} />
            ))}
          </Box>
        )}

        {!error && actions && (
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" } }}>
            {actions.map((action) => (
              <Tooltip key={action.id} title={action.enabled ? "" : "Coming soon"} disableHoverListener={action.enabled}>
                <Box
                  component="button"
                  type="button"
                  disabled={!action.enabled}
                  sx={(theme) => ({
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 0.5,
                    p: 2,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: theme.surfaces.sunken,
                    textAlign: "left",
                    cursor: action.enabled ? "pointer" : "not-allowed",
                    opacity: action.enabled ? 1 : 0.55,
                    font: "inherit",
                    "&:hover": action.enabled ? { borderColor: theme.palette.primary.main } : undefined,
                  })}
                >
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ color: "primary.main" }}>
                    {ICONS[action.icon]}
                    <Typography variant="subtitle2" color="text.primary">
                      {action.label}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {action.description}
                  </Typography>
                </Box>
              </Tooltip>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;
