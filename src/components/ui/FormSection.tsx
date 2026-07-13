import type { ReactNode } from "react";
import { Box, Typography } from "@mui/material";

export interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

const FormSection = ({ title, description, children }: FormSectionProps) => (
  <Box
    sx={(theme) => ({
      p: 3,
      borderRadius: 2.5,
      border: `1px solid ${theme.surfaces.border}`,
      bgcolor: "background.paper",
      boxShadow: theme.customShadows.card,
    })}
  >
    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: description ? 0.5 : 2 }}>
      {title}
    </Typography>
    {description && (
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        {description}
      </Typography>
    )}
    {children}
  </Box>
);

export default FormSection;
