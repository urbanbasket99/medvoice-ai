import { Box, Stack, Typography } from "@mui/material";

import { useAuth } from "../../auth";
import AiActivityCard from "../components/AiActivityCard";
import AppointmentOverviewCard from "../components/AppointmentOverviewCard";
import KpiSection from "../components/KpiSection";
import QuickActionsCard from "../components/QuickActionsCard";
import RecentPatientsCard from "../components/RecentPatientsCard";

/**
 * Dashboard page content only — no `AppLayout` here. The routing layer
 * (`src/App.tsx`) is responsible for wrapping every authenticated page in
 * `AppLayout`, so this component stays reusable and layout-agnostic.
 */
const DashboardPage = () => {
  const { user } = useAuth();
  const firstName = user?.fullName.split(" ")[0];

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" fontWeight={700}>
          {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Here&apos;s what&apos;s happening across the hospital today.
        </Typography>
      </Box>

      <KpiSection />

      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
          alignItems: "stretch",
        }}
      >
        <AppointmentOverviewCard />
        <AiActivityCard />
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          alignItems: "stretch",
        }}
      >
        <RecentPatientsCard />
        <QuickActionsCard />
      </Box>
    </Stack>
  );
};

export default DashboardPage;
