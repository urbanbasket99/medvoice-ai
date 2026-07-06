import { Alert, Card, CardContent, CardHeader, Divider, Skeleton, Stack, Typography, useTheme } from "@mui/material";

import { useAppointmentOverview } from "../hooks/useDashboardData";
import SimpleBarChart from "./charts/SimpleBarChart";
import SimpleDonutChart from "./charts/SimpleDonutChart";
import type { AppointmentStatus } from "../types/dashboard.types";

const STATUS_COLOR_KEY: Record<AppointmentStatus, "success" | "primary" | "error" | "warning"> = {
  completed: "success",
  scheduled: "primary",
  cancelled: "error",
  noShow: "warning",
};

const AppointmentOverviewCard = () => {
  const theme = useTheme();
  const { data, isLoading, error } = useAppointmentOverview();

  return (
    <Card sx={{ height: "100%" }}>
      <CardHeader title="Appointment Overview" subheader="Last 7 days" />
      <Divider />
      <CardContent>
        {error && <Alert severity="error">{error}</Alert>}

        {!error && (isLoading || !data) && (
          <Stack spacing={2}>
            <Skeleton variant="rounded" height={180} />
            <Skeleton variant="rounded" height={80} />
          </Stack>
        )}

        {!error && data && (
          <Stack spacing={3}>
            <SimpleBarChart
              ariaLabel="Scheduled versus completed appointments over the last 7 days"
              categories={data.daily.map((day) => day.label)}
              series={[
                { id: "scheduled", label: "Scheduled", color: theme.palette.primary.main, values: data.daily.map((d) => d.scheduled) },
                { id: "completed", label: "Completed", color: theme.palette.success.main, values: data.daily.map((d) => d.completed) },
              ]}
            />

            <Divider />

            <Stack spacing={1}>
              <Typography variant="subtitle2">Status breakdown</Typography>
              <SimpleDonutChart
                ariaLabel="Appointment status breakdown"
                data={data.statusBreakdown.map((slice) => ({
                  id: slice.status,
                  label: slice.label,
                  value: slice.count,
                  color: theme.palette[STATUS_COLOR_KEY[slice.status]].main,
                }))}
              />
            </Stack>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentOverviewCard;
