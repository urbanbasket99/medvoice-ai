import type { ReactNode } from "react";
import { Box, Stack, Typography } from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";

export interface EmptyStateProps {
  icon: SvgIconComponent;
  title: string;
  description?: string;
  action?: ReactNode;
}

const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => (
  <Stack spacing={2} alignItems="center" sx={{ py: 8, px: 2, textAlign: "center" }}>
    <Icon sx={{ fontSize: 56, color: "text.disabled" }} aria-hidden />
    <Box>
      <Typography variant="body1" color="text.secondary" fontWeight={600}>
        {title}
      </Typography>
      {description ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {description}
        </Typography>
      ) : null}
    </Box>
    {action}
  </Stack>
);

export default EmptyState;
