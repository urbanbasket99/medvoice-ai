import type { ReactNode } from "react";
import { Box, Chip, type ChipProps } from "@mui/material";

export type StatusVariant = "success" | "warning" | "error" | "info" | "neutral" | "default";

const VARIANT_MAP: Record<StatusVariant, Pick<ChipProps, "color" | "variant">> = {
  success: { color: "success", variant: "filled" },
  warning: { color: "warning", variant: "filled" },
  error: { color: "error", variant: "filled" },
  info: { color: "info", variant: "filled" },
  neutral: { color: "default", variant: "outlined" },
  default: { color: "default", variant: "outlined" },
};

export interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  size?: ChipProps["size"];
  icon?: ReactNode;
}

const StatusBadge = ({ label, variant = "default", size = "small", icon }: StatusBadgeProps) => (
  <Chip
    label={label}
    size={size}
    icon={icon}
    sx={{ fontWeight: 600, letterSpacing: "0.02em" }}
    {...VARIANT_MAP[variant]}
  />
);

export default StatusBadge;
