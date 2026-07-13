import { Box, Skeleton, Stack } from "@mui/material";

export interface SkeletonLoaderProps {
  variant?: "card" | "table" | "detail" | "stat";
  count?: number;
}

const SkeletonLoader = ({ variant = "card", count = 1 }: SkeletonLoaderProps) => {
  if (variant === "stat") {
    return (
      <Box
        sx={{
          display: "grid",
          gap: 2.5,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
        }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={120} sx={{ borderRadius: 2.5 }} />
        ))}
      </Box>
    );
  }

  if (variant === "table") {
    return (
      <Stack spacing={1}>
        <Skeleton variant="rounded" height={48} />
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={52} />
        ))}
      </Stack>
    );
  }

  if (variant === "detail") {
    return (
      <Stack spacing={2.5}>
        <Skeleton variant="rounded" height={80} />
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={160} />
        ))}
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="rounded" height={200} sx={{ borderRadius: 2.5 }} />
      ))}
    </Stack>
  );
};

export default SkeletonLoader;
