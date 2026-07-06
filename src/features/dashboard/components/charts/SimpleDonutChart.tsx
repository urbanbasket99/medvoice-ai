import { Box, Stack, Typography, useTheme } from "@mui/material";

export interface DonutChartSlice {
  id: string;
  label: string;
  value: number;
  color: string;
}

export interface SimpleDonutChartProps {
  data: DonutChartSlice[];
  size?: number;
  thickness?: number;
  ariaLabel: string;
  centerLabel?: string;
}

/**
 * Dependency-free donut chart built with the classic `stroke-dasharray`
 * technique on stacked `<circle>` elements — no path/arc math required.
 */
const SimpleDonutChart = ({
  data,
  size = 140,
  thickness = 18,
  ariaLabel,
  centerLabel,
}: SimpleDonutChartProps) => {
  const theme = useTheme();
  const total = data.reduce((sum, slice) => sum + slice.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeOffset = 0;

  return (
    <Stack direction="row" spacing={2.5} alignItems="center" flexWrap="wrap">
      <Box sx={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
        <Box component="svg" role="img" aria-label={ariaLabel} viewBox={`0 0 ${size} ${size}`} sx={{ width: size, height: size }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={theme.palette.divider}
            strokeWidth={thickness}
          />
          {data.map((slice) => {
            const sliceLength = (slice.value / total) * circumference;
            const dasharray = `${sliceLength} ${circumference - sliceLength}`;
            const dashoffset = -cumulativeOffset;
            cumulativeOffset += sliceLength;
            return (
              <circle
                key={slice.id}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth={thickness}
                strokeDasharray={dasharray}
                strokeDashoffset={dashoffset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                strokeLinecap="butt"
              >
                <title>{`${slice.label}: ${slice.value}`}</title>
              </circle>
            );
          })}
        </Box>
        {centerLabel && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <Typography variant="h6" component="span" fontWeight={700}>
              {centerLabel}
            </Typography>
          </Box>
        )}
      </Box>
      <Stack spacing={0.75}>
        {data.map((slice) => (
          <Stack key={slice.id} direction="row" spacing={0.75} alignItems="center">
            <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: slice.color }} />
            <Typography variant="caption" color="text.secondary">
              {slice.label} ({slice.value})
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};

export default SimpleDonutChart;
