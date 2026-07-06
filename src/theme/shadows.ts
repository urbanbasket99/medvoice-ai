import type { PaletteMode, Shadows } from "@mui/material/styles";

/**
 * Named elevation aliases per DESIGN_SYSTEM.md §5, exposed on
 * `theme.customShadows` for intent-based usage (Card, Dialog, Drawer, Modal).
 */
export interface CustomShadows {
  card: string;
  cardHover: string;
  dialog: string;
  drawer: string;
  modal: string;
}

const buildShadow = (offsetY: number, blur: number, alpha: number, mode: PaletteMode): string => {
  const color =
    mode === "dark"
      ? `rgba(0, 0, 0, ${+(alpha * 0.6).toFixed(3)})`
      : `rgba(26, 35, 50, ${alpha})`;
  return `0 ${offsetY}px ${blur}px ${color}`;
};

export const getCustomShadows = (mode: PaletteMode): CustomShadows => ({
  card: buildShadow(1, 3, 0.08, mode),
  cardHover: buildShadow(2, 8, 0.1, mode),
  dialog: buildShadow(4, 16, 0.12, mode),
  drawer: buildShadow(8, 24, 0.14, mode),
  modal: buildShadow(16, 40, 0.16, mode),
});

/**
 * Full 25-slot MUI elevation scale (indices 0-24) built from the 6 design
 * tokens (elevation-0 .. elevation-5); remaining slots repeat elevation-1
 * per DESIGN_SYSTEM.md §5.
 */
export const getShadows = (mode: PaletteMode): Shadows => {
  const elevation0 = "none";
  const elevation1 = buildShadow(1, 3, 0.08, mode);
  const elevation2 = buildShadow(2, 8, 0.1, mode);
  const elevation3 = buildShadow(4, 16, 0.12, mode);
  const elevation4 = buildShadow(8, 24, 0.14, mode);
  const elevation5 = buildShadow(16, 40, 0.16, mode);

  const tailSlots = Array.from({ length: 19 }, () => elevation1);

  return [elevation0, elevation1, elevation2, elevation3, elevation4, elevation5, ...tailSlots] as Shadows;
};
