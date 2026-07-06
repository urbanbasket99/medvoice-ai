import type { TypographyVariantsOptions } from "@mui/material/styles";

import { breakpointValues } from "./breakpoints";

/**
 * Font stacks per DESIGN_SYSTEM.md §2.1.
 * Primary: Inter (loaded via @fontsource/inter in main.tsx).
 * Mono: reserved for MRNs, invoice numbers, ICD codes, lab values.
 */
export const fontFamily = {
  primary: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
  mono: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
};

const mdUp = `@media (min-width:${breakpointValues.md}px)`;

/**
 * Type scale per DESIGN_SYSTEM.md §2.2. h1/h2/h3 scale up at the md
 * breakpoint per §14 (Responsive Typography); all other variants are fixed.
 */
export const getTypography = (): TypographyVariantsOptions => ({
  fontFamily: fontFamily.primary,
  h1: {
    fontSize: "1.75rem",
    fontWeight: 700,
    lineHeight: 1.25,
    letterSpacing: "-0.02em",
    [mdUp]: { fontSize: "2rem" },
  },
  h2: {
    fontSize: "1.25rem",
    fontWeight: 600,
    lineHeight: 1.33,
    letterSpacing: "-0.01em",
    [mdUp]: { fontSize: "1.5rem" },
  },
  h3: {
    fontSize: "1.125rem",
    fontWeight: 600,
    lineHeight: 1.4,
    [mdUp]: { fontSize: "1.25rem" },
  },
  h4: {
    fontSize: "1.125rem",
    fontWeight: 600,
    lineHeight: 1.44,
  },
  h5: {
    fontSize: "1rem",
    fontWeight: 600,
    lineHeight: 1.5,
  },
  h6: {
    fontSize: "0.875rem",
    fontWeight: 600,
    lineHeight: 1.43,
    letterSpacing: "0.01em",
  },
  subtitle1: {
    fontSize: "1rem",
    fontWeight: 600,
    lineHeight: 1.5,
  },
  subtitle2: {
    fontSize: "0.875rem",
    fontWeight: 600,
    lineHeight: 1.43,
  },
  body1: {
    fontSize: "1rem",
    fontWeight: 400,
    lineHeight: 1.5,
  },
  body2: {
    fontSize: "0.875rem",
    fontWeight: 400,
    lineHeight: 1.43,
  },
  caption: {
    fontSize: "0.75rem",
    fontWeight: 400,
    lineHeight: 1.33,
    letterSpacing: "0.02em",
  },
  overline: {
    fontSize: "0.6875rem",
    fontWeight: 600,
    lineHeight: 1.45,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  button: {
    fontSize: "0.875rem",
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: "0.02em",
    textTransform: "none",
  },
});
