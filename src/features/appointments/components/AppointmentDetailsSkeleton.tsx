import { Box, Card, CardContent, Skeleton, Stack } from "@mui/material";

const AppointmentDetailsSkeleton = () => (
  <Stack spacing={3}>
    <Skeleton variant="rounded" height={40} width={180} />
    <Card variant="outlined">
      <CardContent>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Skeleton variant="rounded" width={72} height={72} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="40%" height={32} />
            <Skeleton width="60%" />
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Skeleton variant="rounded" width={80} height={24} />
              <Skeleton variant="rounded" width={80} height={24} />
              <Skeleton variant="rounded" width={80} height={24} />
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
    <Skeleton variant="rounded" height={240} />
  </Stack>
);

export default AppointmentDetailsSkeleton;
