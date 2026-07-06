import { createTheme } from "@mui/material/styles";
import type { PaletteMode, Theme } from "@mui/material/styles";

import { breakpoints } from "./breakpoints";
import { getComponents } from "./components";
import { getClinicalTokens, getPalette, getSurfaceTokens } from "./palette";
import type { ClinicalPalette, SurfaceTokens } from "./palette";
import { getCustomShadows, getShadows } from "./shadows";
import type { CustomShadows } from "./shadows";
import { layout, SPACING_BASE } from "./spacing";
import type { LayoutTokens } from "./spacing";
import { getTypography } from "./typography";

/**
 * Custom theme extensions per ThemeArchitecture.md §9.
 * `clinical`, `layout`, `surfaces` and `customShadows` are attached as
 * top-level theme properties so features consume them as `theme.clinical.*`
 * etc. instead of hardcoded values.
 */
declare module "@mui/material/styles" {
  interface Theme {
    clinical: ClinicalPalette;
    layout: LayoutTokens;
    surfaces: SurfaceTokens;
    customShadows: CustomShadows;
  }

  interface ThemeOptions {
    clinical?: ClinicalPalette;
    layout?: LayoutTokens;
    surfaces?: SurfaceTokens;
    customShadows?: CustomShadows;
  }

  interface BreakpointOverrides {
    xxl: true;
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsVariantOverrides {
    danger: true;
    ghost: true;
  }
}

declare module "@mui/material/Chip" {
  interface ChipPropsVariantOverrides {
    clinicalNormal: true;
    clinicalAbnormal: true;
    clinicalCritical: true;
    clinicalInfo: true;
    clinicalNeutral: true;
  }
}

declare module "@mui/material/Alert" {
  interface AlertPropsVariantOverrides {
    clinicalAllergy: true;
  }
}

/**
 * Theme factory per ThemeArchitecture.md §2. Builds a fully typed MUI theme
 * for the given color mode. No feature code should call `createTheme`
 * directly — always go through this factory.
 */
export const createAppTheme = (mode: PaletteMode = "light"): Theme =>
  createTheme({
    palette: getPalette(mode),
    typography: getTypography(),
    spacing: SPACING_BASE,
    shape: { borderRadius: 8 },
    breakpoints,
    shadows: getShadows(mode),
    clinical: getClinicalTokens(mode),
    layout,
    surfaces: getSurfaceTokens(mode),
    customShadows: getCustomShadows(mode),
    components: getComponents(),
  });

const theme = createAppTheme("light");

export default theme;
