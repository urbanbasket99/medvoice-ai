import type { PaletteMode, PaletteOptions } from "@mui/material/styles";

/**
 * Healthcare & semantic color tokens per DESIGN_SYSTEM.md §1.
 */

export interface ClinicalStatusToken {
  main: string;
  background: string;
}

export interface ClinicalPalette {
  status: {
    normal: ClinicalStatusToken;
    abnormal: ClinicalStatusToken;
    critical: ClinicalStatusToken;
    info: ClinicalStatusToken;
    neutral: ClinicalStatusToken;
  };
  allergy: {
    bannerBackground: string;
    bannerBorder: string;
    bannerText: string;
  };
  ai: {
    panelBackground: string;
    recording: string;
  };
}

export interface SurfaceTokens {
  sunken: string;
  raised: string;
  borderStrong: string;
}

interface ColorGroup {
  primary: { main: string; light: string; dark: string; contrastText: string };
  secondary: { main: string; light: string; dark: string; contrastText: string };
  success: { main: string; light: string; dark: string; contrastText: string };
  warning: { main: string; light: string; dark: string; contrastText: string };
  error: { main: string; light: string; dark: string; contrastText: string };
  info: { main: string; light: string; dark: string; contrastText: string };
  background: { default: string; paper: string };
  text: { primary: string; secondary: string; disabled: string };
  divider: string;
}

const lightColors: ColorGroup = {
  primary: { main: "#0B6E99", light: "#E6F3F9", dark: "#084F6F", contrastText: "#FFFFFF" },
  secondary: { main: "#5C6BC0", light: "#E8EAF6", dark: "#3F4BA8", contrastText: "#FFFFFF" },
  success: { main: "#2E7D4F", light: "#E8F5EC", dark: "#1F5C39", contrastText: "#FFFFFF" },
  warning: { main: "#B86E00", light: "#FFF4E5", dark: "#8F5600", contrastText: "#FFFFFF" },
  error: { main: "#C62828", light: "#FDECEA", dark: "#8E1F1F", contrastText: "#FFFFFF" },
  info: { main: "#0B6E99", light: "#E6F3F9", dark: "#084F6F", contrastText: "#FFFFFF" },
  background: { default: "#F4F6F8", paper: "#FFFFFF" },
  text: { primary: "#1A2332", secondary: "#5A6A7E", disabled: "#9AA8B8" },
  divider: "#ECEFF1",
};

const darkColors: ColorGroup = {
  primary: { main: "#4DA3CC", light: "#0B3D52", dark: "#7EC8E8", contrastText: "#0F1419" },
  secondary: { main: "#9FA8DA", light: "#283593", dark: "#C5CAE9", contrastText: "#0F1419" },
  success: { main: "#66BB6A", light: "#1B3D2A", dark: "#4C9950", contrastText: "#0F1419" },
  warning: { main: "#FFA726", light: "#4D3800", dark: "#CC7A00", contrastText: "#0F1419" },
  error: { main: "#EF5350", light: "#5C1A1A", dark: "#C62828", contrastText: "#0F1419" },
  info: { main: "#4DA3CC", light: "#0B3D52", dark: "#7EC8E8", contrastText: "#0F1419" },
  background: { default: "#0F1419", paper: "#1E2530" },
  text: { primary: "#E8ECF0", secondary: "#9AA8B8", disabled: "#5A6A7E" },
  divider: "#2D3748",
};

/**
 * Neutral healthcare grays per DESIGN_SYSTEM.md §1.2 — a single fixed ramp
 * (light → dark) reused across both color modes, matching MUI's grey
 * convention where the scale itself does not invert with theme mode.
 */
const grey = {
  50: "#F9FAFB",
  100: "#F4F6F8",
  200: "#ECEFF1",
  300: "#DDE3EA",
  400: "#B0BEC9",
  500: "#9AA8B8",
  600: "#5A6A7E",
  700: "#3D4F63",
  800: "#1A2332",
  900: "#0F1419",
};

export const getPalette = (mode: PaletteMode): PaletteOptions => {
  const colors = mode === "dark" ? darkColors : lightColors;

  return {
    mode,
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
    background: colors.background,
    text: colors.text,
    divider: colors.divider,
    grey,
    action: {
      hover:
        mode === "dark" ? "rgba(232, 236, 240, 0.08)" : "rgba(11, 110, 153, 0.06)",
      selected:
        mode === "dark" ? "rgba(77, 163, 204, 0.16)" : "rgba(11, 110, 153, 0.10)",
      disabled: colors.text.disabled,
      disabledBackground:
        mode === "dark" ? "rgba(232, 236, 240, 0.12)" : "rgba(26, 35, 50, 0.06)",
      focus: mode === "dark" ? "rgba(77, 163, 204, 0.24)" : "rgba(11, 110, 153, 0.18)",
    },
  };
};

/**
 * Clinical status colors per DESIGN_SYSTEM.md §1.5. These are fixed
 * (non-brand-swappable) so patient safety semantics never change.
 */
export const getClinicalTokens = (mode: PaletteMode): ClinicalPalette => {
  const isDark = mode === "dark";

  return {
    status: {
      normal: {
        main: isDark ? "#66BB6A" : "#2E7D4F",
        background: isDark ? "#1B3D2A" : "#E8F5EC",
      },
      abnormal: {
        main: isDark ? "#FFA726" : "#B86E00",
        background: isDark ? "#4D3800" : "#FFF4E5",
      },
      critical: {
        main: isDark ? "#EF5350" : "#C62828",
        background: isDark ? "#5C1A1A" : "#FDECEA",
      },
      info: {
        main: isDark ? "#4DA3CC" : "#0B6E99",
        background: isDark ? "#0B3D52" : "#E6F3F9",
      },
      neutral: {
        main: isDark ? "#9AA8B8" : "#5A6A7E",
        background: isDark ? "#2D3748" : "#ECEFF1",
      },
    },
    allergy: {
      bannerBackground: isDark ? "#5C1A1A" : "#FDECEA",
      bannerBorder: isDark ? "#EF5350" : "#C62828",
      bannerText: isDark ? "#FF8A80" : "#8E1F1F",
    },
    ai: {
      panelBackground: isDark ? "#283593" : "#E8EAF6",
      recording: isDark ? "#EF5350" : "#C62828",
    },
  };
};

/**
 * Additional surface/border tokens referenced by component overrides
 * (sunken inputs, table headers, raised modals, strong borders).
 */
export const getSurfaceTokens = (mode: PaletteMode): SurfaceTokens =>
  mode === "dark"
    ? { sunken: "#161B22", raised: "#252D3A", borderStrong: "#4A5568" }
    : { sunken: "#F9FAFB", raised: "#FFFFFF", borderStrong: "#B0BEC9" };
