import type { PaletteMode, PaletteOptions } from "@mui/material/styles";

/**
 * Enterprise healthcare color tokens — MedVoice AI Design System.
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
  border: string;
}

export type AppThemeMode = PaletteMode | "hospitalBlue";

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
  primary: { main: "#0F4C81", light: "#E8F1F8", dark: "#0A3559", contrastText: "#FFFFFF" },
  secondary: { main: "#1976D2", light: "#E3F2FD", dark: "#115293", contrastText: "#FFFFFF" },
  success: { main: "#2E7D32", light: "#E8F5E9", dark: "#1B5E20", contrastText: "#FFFFFF" },
  warning: { main: "#ED6C02", light: "#FFF3E0", dark: "#E65100", contrastText: "#FFFFFF" },
  error: { main: "#D32F2F", light: "#FFEBEE", dark: "#C62828", contrastText: "#FFFFFF" },
  info: { main: "#0288D1", light: "#E1F5FE", dark: "#01579B", contrastText: "#FFFFFF" },
  background: { default: "#F5F8FC", paper: "#FFFFFF" },
  text: { primary: "#1A2332", secondary: "#5A6A7E", disabled: "#9AA8B8" },
  divider: "#E5EAF2",
};

const hospitalBlueColors: ColorGroup = {
  primary: { main: "#0F4C81", light: "#D6E8F5", dark: "#083A62", contrastText: "#FFFFFF" },
  secondary: { main: "#1565C0", light: "#BBDEFB", dark: "#0D47A1", contrastText: "#FFFFFF" },
  success: { main: "#2E7D32", light: "#E8F5E9", dark: "#1B5E20", contrastText: "#FFFFFF" },
  warning: { main: "#ED6C02", light: "#FFF3E0", dark: "#E65100", contrastText: "#FFFFFF" },
  error: { main: "#D32F2F", light: "#FFEBEE", dark: "#C62828", contrastText: "#FFFFFF" },
  info: { main: "#0288D1", light: "#E1F5FE", dark: "#01579B", contrastText: "#FFFFFF" },
  background: { default: "#EEF4FA", paper: "#FFFFFF" },
  text: { primary: "#0D2137", secondary: "#4A6278", disabled: "#8FA3B8" },
  divider: "#C8D9E8",
};

const darkColors: ColorGroup = {
  primary: { main: "#5B9BD5", light: "#1A3A52", dark: "#8BBCE8", contrastText: "#0F1419" },
  secondary: { main: "#64B5F6", light: "#0D2F4A", dark: "#90CAF9", contrastText: "#0F1419" },
  success: { main: "#66BB6A", light: "#1B3D2A", dark: "#4CAF50", contrastText: "#0F1419" },
  warning: { main: "#FFA726", light: "#4D3800", dark: "#FF9800", contrastText: "#0F1419" },
  error: { main: "#EF5350", light: "#5C1A1A", dark: "#F44336", contrastText: "#0F1419" },
  info: { main: "#29B6F6", light: "#0B3D52", dark: "#03A9F4", contrastText: "#0F1419" },
  background: { default: "#0F1419", paper: "#1A2332" },
  text: { primary: "#E8ECF0", secondary: "#9AA8B8", disabled: "#5A6A7E" },
  divider: "#2D3748",
};

const grey = {
  50: "#F9FAFB",
  100: "#F5F8FC",
  200: "#E5EAF2",
  300: "#D0D8E4",
  400: "#B0BEC9",
  500: "#9AA8B8",
  600: "#5A6A7E",
  700: "#3D4F63",
  800: "#1A2332",
  900: "#0F1419",
};

const resolveColors = (mode: AppThemeMode): ColorGroup => {
  if (mode === "dark") return darkColors;
  if (mode === "hospitalBlue") return hospitalBlueColors;
  return lightColors;
};

const resolvePaletteMode = (mode: AppThemeMode): PaletteMode =>
  mode === "dark" ? "dark" : "light";

export const getPalette = (mode: AppThemeMode = "light"): PaletteOptions => {
  const colors = resolveColors(mode);
  const paletteMode = resolvePaletteMode(mode);

  return {
    mode: paletteMode,
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
        paletteMode === "dark" ? "rgba(232, 236, 240, 0.08)" : "rgba(15, 76, 129, 0.06)",
      selected:
        paletteMode === "dark" ? "rgba(91, 155, 213, 0.16)" : "rgba(15, 76, 129, 0.10)",
      disabled: colors.text.disabled,
      disabledBackground:
        paletteMode === "dark" ? "rgba(232, 236, 240, 0.12)" : "rgba(26, 35, 50, 0.06)",
      focus: paletteMode === "dark" ? "rgba(91, 155, 213, 0.24)" : "rgba(15, 76, 129, 0.18)",
    },
  };
};

export const getClinicalTokens = (mode: AppThemeMode): ClinicalPalette => {
  const isDark = mode === "dark";

  return {
    status: {
      normal: {
        main: isDark ? "#66BB6A" : "#2E7D32",
        background: isDark ? "#1B3D2A" : "#E8F5E9",
      },
      abnormal: {
        main: isDark ? "#FFA726" : "#ED6C02",
        background: isDark ? "#4D3800" : "#FFF3E0",
      },
      critical: {
        main: isDark ? "#EF5350" : "#D32F2F",
        background: isDark ? "#5C1A1A" : "#FFEBEE",
      },
      info: {
        main: isDark ? "#29B6F6" : "#0288D1",
        background: isDark ? "#0B3D52" : "#E1F5FE",
      },
      neutral: {
        main: isDark ? "#9AA8B8" : "#5A6A7E",
        background: isDark ? "#2D3748" : "#E5EAF2",
      },
    },
    allergy: {
      bannerBackground: isDark ? "#5C1A1A" : "#FFEBEE",
      bannerBorder: isDark ? "#EF5350" : "#D32F2F",
      bannerText: isDark ? "#FF8A80" : "#B71C1C",
    },
    ai: {
      panelBackground: isDark ? "#1A3A52" : "#E8F1F8",
      recording: isDark ? "#EF5350" : "#D32F2F",
    },
  };
};

export const getSurfaceTokens = (mode: AppThemeMode): SurfaceTokens => {
  if (mode === "dark") {
    return { sunken: "#161B22", raised: "#252D3A", borderStrong: "#4A5568", border: "#2D3748" };
  }
  return { sunken: "#F5F8FC", raised: "#FFFFFF", borderStrong: "#B0BEC9", border: "#E5EAF2" };
};
