import type { ReactNode } from "react";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";

export interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  trend?: ReactNode;
  subtitle?: string;
  accentColor?: string;
  onClick?: () => void;
}

const StatCard = ({
  label,
  value,
  icon,
  trend,
  subtitle,
  accentColor = "primary.main",
  onClick,
}: StatCardProps) => (
  <Card
    onClick={onClick}
    sx={(theme) => ({
      height: "100%",
      cursor: onClick ? "pointer" : "default",
      border: `1px solid ${theme.surfaces.border}`,
      boxShadow: theme.customShadows.card,
      transition: "box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease",
      "&:hover": {
        boxShadow: theme.customShadows.cardHover,
        borderColor: theme.palette.primary.light,
        transform: onClick ? "translateY(-1px)" : undefined,
      },
    })}
  >
    <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Typography
          variant="caption"
          sx={{ fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "text.secondary" }}
        >
          {label}
        </Typography>
        {icon && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: "primary.light",
              color: accentColor,
            }}
          >
            {icon}
          </Box>
        )}
      </Stack>
      <Typography variant="h4" component="p" sx={{ fontWeight: 700, mt: 1.5, letterSpacing: "-0.02em" }}>
        {value}
      </Typography>
      {trend && <Box sx={{ mt: 1 }}>{trend}</Box>}
      {subtitle && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

export default StatCard;
