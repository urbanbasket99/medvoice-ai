import { Card, CardContent, CardHeader, Skeleton, Stack } from "@mui/material";

const DoctorDetailsSkeleton = () => (
  <Stack spacing={3}>
    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
      <Skeleton variant="circular" width={72} height={72} />
      <Stack spacing={1} sx={{ flex: 1 }}>
        <Skeleton variant="text" width="40%" height={32} />
        <Skeleton variant="text" width="25%" />
      </Stack>
    </Stack>
    {[1, 2, 3].map((section) => (
      <Card key={section} variant="outlined">
        <CardHeader title={<Skeleton variant="text" width="30%" />} />
        <CardContent>
          <Stack spacing={2}>
            <Skeleton variant="rounded" height={60} />
            <Skeleton variant="rounded" height={60} />
          </Stack>
        </CardContent>
      </Card>
    ))}
  </Stack>
);

export default DoctorDetailsSkeleton;
