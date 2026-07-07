import { Card, CardContent, Skeleton, Stack } from "@mui/material";

const InvoiceDetailsSkeleton = () => (
  <Stack spacing={3}>
    <Skeleton variant="rectangular" height={40} width={200} sx={{ borderRadius: 1 }} />
    <Stack spacing={1}>
      <Skeleton variant="text" width="40%" height={36} />
      <Skeleton variant="text" width="25%" height={24} />
    </Stack>
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Skeleton variant="text" width="30%" />
          <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1 }} />
        </Stack>
      </CardContent>
    </Card>
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Skeleton variant="text" width="30%" />
          <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
        </Stack>
      </CardContent>
    </Card>
  </Stack>
);

export default InvoiceDetailsSkeleton;
