import { Box, Card, CardContent, Skeleton, Stack } from "@mui/material";

/**
 * Structural placeholder shown while `usePatient` is loading — mirrors the
 * real layout (header row + card sections) so the page doesn't visibly
 * "jump" once data arrives, instead of a generic centered spinner.
 */
const PatientDetailsSkeleton = () => (
  <Stack spacing={3}>
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
    >
      <Box sx={{ width: { xs: "100%", sm: 320 } }}>
        <Skeleton variant="text" width={140} height={20} />
        <Skeleton variant="text" width="70%" height={36} />
        <Skeleton variant="text" width={180} height={20} />
      </Box>
      <Skeleton variant="rounded" width={140} height={40} />
    </Stack>

    {[0, 1, 2].map((index) => (
      <Card key={index} variant="outlined">
        <CardContent>
          <Skeleton variant="text" width={180} height={28} sx={{ mb: 2 }} />
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" },
            }}
          >
            {Array.from({ length: 6 }).map((_, cellIndex) => (
              <Box key={cellIndex}>
                <Skeleton variant="text" width="50%" height={16} />
                <Skeleton variant="text" width="80%" height={22} />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    ))}
  </Stack>
);

export default PatientDetailsSkeleton;
