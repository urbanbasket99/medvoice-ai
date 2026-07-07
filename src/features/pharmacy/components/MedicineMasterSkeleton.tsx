import { Skeleton, Stack } from "@mui/material";

const MedicineMasterSkeleton = () => (
  <Stack spacing={3}>
    <Skeleton variant="rounded" height={48} width={320} />
    <Skeleton variant="rounded" height={56} />
    <Skeleton variant="rounded" height={400} />
  </Stack>
);

export default MedicineMasterSkeleton;
