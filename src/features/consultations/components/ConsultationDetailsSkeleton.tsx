import { Box, Card, CardContent, Skeleton, Stack } from "@mui/material";

const ConsultationDetailsSkeleton = () => (
  <Stack spacing={3}>
    <Skeleton variant="rounded" height={40} width={220} />
    <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", lg: "320px 1fr" } }}>
      <Skeleton variant="rounded" height={420} />
      <Skeleton variant="rounded" height={620} />
    </Box>
  </Stack>
);

export default ConsultationDetailsSkeleton;
