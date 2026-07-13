import type { ReactNode } from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";

export interface EmptyStateProps {
  icon: SvgIconComponent;
  title: string;
  description?: string;
  action?: ReactNode;
}

const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => (
  <Paper
    variant="outlined"
    sx={{
      py: 8,
      px: 3,
      textAlign: "center",
      borderStyle: "dashed",
      bgcolor: (theme) => theme.surfaces.sunken,
      "@keyframes emptyFadeIn": {
        from: { opacity: 0, transform: "scale(0.98)" },
        to: { opacity: 1, transform: "scale(1)" },
      },
      animation: "emptyFadeIn 0.3s ease-out",
      "@media (prefers-reduced-motion: reduce)": {
        animation: "none",
      },
    }}
  >
    <Stack spacing={2} alignItems="center">
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.paper",
          border: 1,
          borderColor: "divider",
        }}
      >
        <Icon sx={{ fontSize: 36, color: "text.disabled" }} aria-hidden />
      </Box>
      <Box>
        <Typography variant="subtitle1" fontWeight={600}>
          {title}
        </Typography>
        {description ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 360, mx: "auto" }}>
            {description}
          </Typography>
        ) : null}
      </Box>
      {action}
    </Stack>
  </Paper>
);

export default EmptyState;
