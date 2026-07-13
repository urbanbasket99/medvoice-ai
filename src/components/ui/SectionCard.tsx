import type { ReactNode } from "react";
import { Box, Card, CardContent, CardHeader, Divider, Typography } from "@mui/material";

export interface SectionCardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  noPadding?: boolean;
  variant?: "elevated" | "outlined" | "flat";
}

const SectionCard = ({
  title,
  subtitle,
  action,
  children,
  noPadding = false,
  variant = "elevated",
}: SectionCardProps) => (
  <Card
    variant={variant === "outlined" ? "outlined" : undefined}
    sx={(theme) => ({
      height: "100%",
      border: variant === "flat" ? "none" : `1px solid ${theme.surfaces.border}`,
      boxShadow: variant === "elevated" ? theme.customShadows.card : "none",
      bgcolor: variant === "flat" ? "transparent" : "background.paper",
      transition: "box-shadow 0.2s ease",
      "&:hover":
        variant === "elevated"
          ? { boxShadow: theme.customShadows.cardHover }
          : undefined,
    })}
  >
    <CardHeader
      title={
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      }
      subheader={subtitle}
      action={action}
      sx={{ pb: 0.5, "& .MuiCardHeader-action": { alignSelf: "center", m: 0 } }}
    />
    <Divider />
    {noPadding ? children : <CardContent>{children}</CardContent>}
  </Card>
);

export interface DetailRowProps {
  label: string;
  value: ReactNode;
  mono?: boolean;
}

export const DetailRow = ({ label, value, mono = false }: DetailRowProps) => (
  <Box>
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{ mt: 0.25, fontWeight: 500, ...(mono ? { fontFamily: "monospace", letterSpacing: "0.02em" } : {}) }}
    >
      {value ?? "\u2014"}
    </Typography>
  </Box>
);

export const detailGridSx = {
  display: "grid",
  gap: 2.5,
  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" },
} as const;

export interface DetailSectionProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}

export const DetailSection = ({ title, action, children }: DetailSectionProps) => (
  <SectionCard title={title} action={action}>
    <Box sx={detailGridSx}>{children}</Box>
  </SectionCard>
);

export default SectionCard;
