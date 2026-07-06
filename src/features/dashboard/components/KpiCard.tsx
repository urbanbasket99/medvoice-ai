import type { ReactElement } from "react";
import { Avatar, Box, Card, CardContent, Stack, Typography, useTheme } from "@mui/material";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import TrendingFlatRoundedIcon from "@mui/icons-material/TrendingFlatRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import GraphicEqRoundedIcon from "@mui/icons-material/GraphicEqRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";

import type { KpiIconKey, KpiMetric, TrendDirection } from "../types/dashboard.types";

export interface KpiCardProps {
  metric: KpiMetric;
}

const ICONS: Record<KpiIconKey, ReactElement> = {
  patients: <GroupsRoundedIcon fontSize="small" />,
  appointments: <EventAvailableRoundedIcon fontSize="small" />,
  transcriptions: <GraphicEqRoundedIcon fontSize="small" />,
  pendingReviews: <FactCheckRoundedIcon fontSize="small" />,
};

const TREND_ICONS: Record<TrendDirection, ReactElement> = {
  up: <TrendingUpRoundedIcon fontSize="inherit" />,
  down: <TrendingDownRoundedIcon fontSize="inherit" />,
  flat: <TrendingFlatRoundedIcon fontSize="inherit" />,
};

const KpiCard = ({ metric }: KpiCardProps) => {
  const theme = useTheme();

  const trendColor =
    metric.trend.direction === "up"
      ? theme.palette.success.main
      : metric.trend.direction === "down"
        ? theme.palette.error.main
        : theme.palette.text.secondary;

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            {metric.label}
          </Typography>
          <Avatar
            variant="rounded"
            sx={{
              width: 36,
              height: 36,
              backgroundColor: theme.palette.primary.light,
              color: theme.palette.primary.dark,
            }}
          >
            {ICONS[metric.icon]}
          </Avatar>
        </Stack>

        <Typography variant="h4" component="p" fontWeight={700} sx={{ mt: 1.5 }}>
          {metric.value}
        </Typography>

        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1 }}>
          <Box sx={{ display: "flex", color: trendColor, fontSize: 18 }}>
            {TREND_ICONS[metric.trend.direction]}
          </Box>
          <Typography variant="caption" fontWeight={600} sx={{ color: trendColor }}>
            {metric.trend.changePercent}%
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {metric.trend.comparisonLabel}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default KpiCard;
