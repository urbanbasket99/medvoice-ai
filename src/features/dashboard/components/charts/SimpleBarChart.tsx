import { Box, Stack, Typography, useTheme } from "@mui/material";

export interface BarChartSeries {
  id: string;
  label: string;
  color: string;
  values: number[];
}

export interface SimpleBarChartProps {
  categories: string[];
  series: BarChartSeries[];
  height?: number;
  ariaLabel: string;
}

const CHART_WIDTH = 480;

/**
 * Dependency-free, theme-aware grouped bar chart. Renders as an SVG with a
 * `viewBox` so it scales fluidly with its container (no ResizeObserver or
 * charting library required) — this is what makes it "responsive".
 */
const SimpleBarChart = ({ categories, series, height = 220, ariaLabel }: SimpleBarChartProps) => {
  const theme = useTheme();
  const maxValue = Math.max(1, ...series.flatMap((item) => item.values));

  const paddingX = 16;
  const paddingBottom = 28;
  const plotWidth = CHART_WIDTH - paddingX * 2;
  const plotHeight = height - paddingBottom;
  const groupWidth = plotWidth / categories.length;
  const barGap = 4;
  const barWidth = (groupWidth - barGap * (series.length + 1)) / series.length;

  return (
    <Box>
      <Box
        component="svg"
        role="img"
        aria-label={ariaLabel}
        viewBox={`0 0 ${CHART_WIDTH} ${height}`}
        sx={{ width: "100%", height: "auto", display: "block" }}
      >
        <line
          x1={paddingX}
          y1={plotHeight}
          x2={CHART_WIDTH - paddingX}
          y2={plotHeight}
          stroke={theme.palette.divider}
          strokeWidth={1}
        />
        {categories.map((category, categoryIndex) => {
          const groupX = paddingX + categoryIndex * groupWidth;
          return (
            <g key={category}>
              {series.map((item, seriesIndex) => {
                const value = item.values[categoryIndex] ?? 0;
                const barHeight = (value / maxValue) * (plotHeight - 8);
                const x = groupX + barGap + seriesIndex * (barWidth + barGap);
                const y = plotHeight - barHeight;
                return (
                  <rect
                    key={item.id}
                    x={x}
                    y={y}
                    width={Math.max(barWidth, 1)}
                    height={Math.max(barHeight, 0)}
                    rx={2}
                    fill={item.color}
                  >
                    <title>{`${item.label}, ${category}: ${value}`}</title>
                  </rect>
                );
              })}
              <text
                x={groupX + groupWidth / 2}
                y={height - 8}
                textAnchor="middle"
                fontSize={11}
                fill={theme.palette.text.secondary}
                fontFamily={theme.typography.fontFamily}
              >
                {category}
              </text>
            </g>
          );
        })}
      </Box>
      <Stack direction="row" spacing={2.5} flexWrap="wrap" justifyContent="center" sx={{ mt: 1.5 }}>
        {series.map((item) => (
          <Stack key={item.id} direction="row" spacing={0.75} alignItems="center">
            <Box sx={{ width: 10, height: 10, borderRadius: "2px", backgroundColor: item.color }} />
            <Typography variant="caption" color="text.secondary">
              {item.label}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
};

export default SimpleBarChart;
