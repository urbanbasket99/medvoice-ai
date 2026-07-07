import { Skeleton, Stack } from "@mui/material";

const PrescriptionDetailsSkeleton = () => (
  <Stack spacing={3}>
    <Skeleton variant="rounded" height={40} width={220} />
    <Skeleton variant="rounded" height={200} />
    <Skeleton variant="rounded" height={420} />
  </Stack>
);

export default PrescriptionDetailsSkeleton;
