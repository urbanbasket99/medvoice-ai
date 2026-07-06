import { Alert, Box, Skeleton } from "@mui/material";

import { useKpis } from "../hooks/useDashboardData";
import KpiCard from "./KpiCard";

const SKELETON_COUNT = 4;

const gridSx = {
  display: "grid",
  gap: 3,
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, 1fr)",
    md: "repeat(4, 1fr)",
  },
} as const;

const KpiSection = () => {
  const { data: kpis, isLoading, error } = useKpis();

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (isLoading || !kpis) {
    return (
      <Box sx={gridSx}>
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          <Skeleton key={index} variant="rounded" height={128} />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={gridSx}>
      {kpis.map((metric) => (
        <KpiCard key={metric.id} metric={metric} />
      ))}
    </Box>
  );
};

export default KpiSection;
