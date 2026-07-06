import type { BreakpointsOptions } from "@mui/material/styles";

/**
 * Responsive breakpoint values (px) per DESIGN_SYSTEM.md §19.
 * xs-xl match MUI defaults; xxl is a custom addition for ultra-wide monitors.
 */
export const breakpointValues = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
  xxl: 1920,
} as const;

export const breakpoints: BreakpointsOptions = {
  values: breakpointValues,
};
