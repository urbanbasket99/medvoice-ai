/**
 * Base spacing unit (px) per DESIGN_SYSTEM.md §3 — 4px grid.
 * Passed directly to createTheme({ spacing }) so theme.spacing(1) === 4px.
 */
export const SPACING_BASE = 4;

export interface LayoutTokens {
  headerHeight: number;
  breadcrumbHeight: number;
  sidebarExpanded: number;
  sidebarCollapsed: number;
  contentMaxWidth: number;
  formMaxWidth: number;
  formWideMaxWidth: number;
  dialogSm: number;
  dialogMd: number;
  dialogLg: number;
}

/**
 * Layout constants per DESIGN_SYSTEM.md §3.5 — shell dimensions used by
 * component overrides (AppBar height, Drawer width, Dialog widths, etc.).
 */
export const layout: LayoutTokens = {
  headerHeight: 64,
  breadcrumbHeight: 40,
  sidebarExpanded: 260,
  sidebarCollapsed: 72,
  contentMaxWidth: 1440,
  formMaxWidth: 720,
  formWideMaxWidth: 960,
  dialogSm: 480,
  dialogMd: 640,
  dialogLg: 900,
};
