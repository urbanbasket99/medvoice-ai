import { Skeleton, Stack } from "@mui/material";

const LabOrderDetailsSkeleton = () => (
  <Stack spacing={3}>
    <Skeleton variant="rounded" height={40} width={220} />
    <Skeleton variant="rounded" height={200} />
    <Skeleton variant="rounded" height={320} />
    <Skeleton variant="rounded" height={280} />
  </Stack>
);

export default LabOrderDetailsSkeleton;
