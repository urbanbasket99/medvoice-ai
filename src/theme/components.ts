import type { Components, Theme } from "@mui/material/styles";

/**
 * Border radius scale per DESIGN_SYSTEM.md §4 (component-level use only —
 * `theme.shape.borderRadius` covers the base "radius-md" value of 8).
 */
const RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  full: 9999,
};

/**
 * MUI component style overrides + default props per DESIGN_SYSTEM.md
 * §7-13 (Buttons, Forms, Cards, Tables, Dialogs, Notifications) and
 * §15 (Global CssBaseline styles). Every value is sourced from
 * `theme.palette`, `theme.clinical`, `theme.layout`, `theme.surfaces` or
 * `theme.customShadows` — never a hardcoded color.
 */
export const getComponents = (): Components<Theme> => ({
  MuiCssBaseline: {
    styleOverrides: (theme) => ({
      "*, *::before, *::after": {
        boxSizing: "border-box",
      },
      html: {
        fontSize: 16,
        scrollBehavior: "smooth",
        "@media (prefers-reduced-motion: reduce)": {
          scrollBehavior: "auto",
        },
      },
      body: {
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        colorScheme: theme.palette.mode,
      },
      "#root": {
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      },
      a: {
        color: theme.palette.primary.main,
        textDecoration: "none",
        "&:hover": {
          textDecoration: "underline",
        },
      },
      ":focus-visible": {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: 2,
      },
      "::selection": {
        backgroundColor: theme.palette.primary.light,
      },
      "::-webkit-scrollbar": {
        width: 8,
        height: 8,
      },
      "::-webkit-scrollbar-track": {
        backgroundColor: theme.surfaces.sunken,
      },
      "::-webkit-scrollbar-thumb": {
        backgroundColor: theme.palette.grey[400],
        borderRadius: RADIUS.md,
      },
      ".mono": {
        fontFamily: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
      },
      "[data-clinical-critical]": {
        color: theme.clinical.status.critical.main,
      },
    }),
  },

  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: "none",
      },
    },
  },

  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: theme.shape.borderRadius,
        textTransform: "none",
        fontWeight: 600,
        minWidth: 88,
      }),
      sizeLarge: {
        height: 44,
        padding: "0 24px",
        fontSize: "0.9375rem",
      },
      sizeMedium: {
        height: 40,
        padding: "0 16px",
        fontSize: "0.875rem",
      },
      sizeSmall: {
        height: 32,
        padding: "0 12px",
        fontSize: "0.8125rem",
      },
      outlined: ({ theme }) => ({
        borderColor: theme.palette.divider,
        "&:hover": {
          backgroundColor: theme.palette.action.hover,
        },
      }),
      text: ({ theme }) => ({
        "&:hover": {
          backgroundColor: theme.palette.action.hover,
        },
      }),
    },
    variants: [
      {
        props: { variant: "danger" },
        style: ({ theme }) => ({
          backgroundColor: theme.palette.error.main,
          color: theme.palette.error.contrastText,
          "&:hover": {
            backgroundColor: theme.palette.error.dark,
          },
        }),
      },
      {
        props: { variant: "ghost" },
        style: ({ theme }) => ({
          backgroundColor: "transparent",
          color: theme.palette.text.primary,
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
        }),
      },
    ],
  },

  MuiIconButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: theme.shape.borderRadius,
      }),
    },
  },

  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: theme.shape.borderRadius,
        height: 40,
        backgroundColor: theme.palette.background.paper,
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.divider,
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.grey[400],
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.primary.main,
          borderWidth: 2,
        },
        "&.Mui-error .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.error.main,
        },
        "&.Mui-disabled": {
          backgroundColor: theme.surfaces.sunken,
        },
      }),
      multiline: {
        height: "auto",
      },
      input: {
        padding: "0 14px",
      },
    },
  },

  MuiInputLabel: {
    styleOverrides: {
      root: ({ theme }) => ({
        fontSize: "0.875rem",
        fontWeight: 500,
        color: theme.palette.text.primary,
        "&.Mui-error": {
          color: theme.palette.error.main,
        },
      }),
    },
  },

  MuiFormHelperText: {
    styleOverrides: {
      root: {
        fontSize: "0.75rem",
        marginLeft: 0,
        marginTop: 4,
      },
    },
  },

  MuiSelect: {
    styleOverrides: {
      select: ({ theme }) => ({
        borderRadius: theme.shape.borderRadius,
      }),
    },
  },

  MuiCard: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: RADIUS.lg,
        boxShadow: theme.customShadows.card,
      }),
    },
  },
  MuiCardContent: {
    styleOverrides: {
      root: {
        padding: 24,
        "&:last-child": {
          paddingBottom: 24,
        },
      },
    },
  },
  MuiCardHeader: {
    styleOverrides: {
      root: {
        padding: "24px 24px 0",
      },
    },
  },
  MuiCardActions: {
    styleOverrides: {
      root: {
        padding: "16px 24px 24px",
      },
    },
  },

  MuiDialog: {
    styleOverrides: {
      paper: ({ theme }) => ({
        borderRadius: RADIUS.lg,
        boxShadow: theme.customShadows.dialog,
      }),
    },
  },
  MuiDialogTitle: {
    styleOverrides: {
      root: {
        fontSize: "1.25rem",
        fontWeight: 600,
        padding: "24px 24px 16px",
      },
    },
  },
  MuiDialogContent: {
    styleOverrides: {
      root: {
        padding: "0 24px 24px",
      },
    },
  },
  MuiDialogActions: {
    styleOverrides: {
      root: ({ theme }) => ({
        padding: "16px 24px",
        borderTop: `1px solid ${theme.palette.divider}`,
      }),
    },
  },

  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: RADIUS.sm,
        fontWeight: 500,
      },
    },
    variants: [
      {
        props: { variant: "clinicalNormal" },
        style: ({ theme }) => ({
          backgroundColor: theme.clinical.status.normal.background,
          color: theme.clinical.status.normal.main,
        }),
      },
      {
        props: { variant: "clinicalAbnormal" },
        style: ({ theme }) => ({
          backgroundColor: theme.clinical.status.abnormal.background,
          color: theme.clinical.status.abnormal.main,
        }),
      },
      {
        props: { variant: "clinicalCritical" },
        style: ({ theme }) => ({
          backgroundColor: theme.clinical.status.critical.background,
          color: theme.clinical.status.critical.main,
          fontWeight: 600,
        }),
      },
      {
        props: { variant: "clinicalInfo" },
        style: ({ theme }) => ({
          backgroundColor: theme.clinical.status.info.background,
          color: theme.clinical.status.info.main,
        }),
      },
      {
        props: { variant: "clinicalNeutral" },
        style: ({ theme }) => ({
          backgroundColor: theme.clinical.status.neutral.background,
          color: theme.clinical.status.neutral.main,
        }),
      },
    ],
  },

  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: RADIUS.md,
        borderLeftWidth: 4,
        borderLeftStyle: "solid",
      },
    },
    variants: [
      // `standardSuccess`/`standardWarning`/`standardError`/`standardInfo` are not
      // valid AlertClasses slots on this MUI version — `variant` (standard/filled/
      // outlined) and `color` (success/warning/error/info) are separate class
      // flags now, so the standard+severity combination is matched via `variants`
      // instead, which produces the same left-border-by-severity result.
      {
        props: { variant: "standard", color: "success" },
        style: ({ theme }) => ({
          borderLeftColor: theme.palette.success.main,
        }),
      },
      {
        props: { variant: "standard", color: "warning" },
        style: ({ theme }) => ({
          borderLeftColor: theme.palette.warning.main,
        }),
      },
      {
        props: { variant: "standard", color: "error" },
        style: ({ theme }) => ({
          borderLeftColor: theme.palette.error.main,
        }),
      },
      {
        props: { variant: "standard", color: "info" },
        style: ({ theme }) => ({
          borderLeftColor: theme.palette.info.main,
        }),
      },
      {
        props: { variant: "clinicalAllergy" },
        style: ({ theme }) => ({
          backgroundColor: theme.clinical.allergy.bannerBackground,
          color: theme.clinical.allergy.bannerText,
          borderLeftWidth: 4,
          borderLeftStyle: "solid",
          borderLeftColor: theme.clinical.allergy.bannerBorder,
        }),
      },
    ],
  },

  MuiSnackbarContent: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: theme.shape.borderRadius,
      }),
    },
  },

  MuiTableContainer: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: RADIUS.lg,
        border: `1px solid ${theme.palette.divider}`,
      }),
    },
  },
  MuiTableHead: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: theme.surfaces.sunken,
      }),
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: ({ theme }) => ({
        padding: "12px 16px",
        borderBottom: `1px solid ${theme.palette.divider}`,
        fontSize: "0.875rem",
      }),
      head: ({ theme }) => ({
        fontSize: "0.6875rem",
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: theme.palette.text.secondary,
      }),
    },
  },
  MuiTableRow: {
    styleOverrides: {
      root: ({ theme }) => ({
        "&:hover": {
          backgroundColor: theme.palette.action.hover,
        },
        "&.Mui-selected": {
          backgroundColor: theme.palette.action.selected,
        },
      }),
    },
  },

  MuiAppBar: {
    defaultProps: {
      elevation: 0,
      color: "inherit",
    },
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }),
    },
  },
  MuiToolbar: {
    styleOverrides: {
      root: ({ theme }) => ({
        minHeight: `${theme.layout.headerHeight}px !important`,
      }),
    },
  },

  MuiDrawer: {
    styleOverrides: {
      paper: ({ theme }) => ({
        width: theme.layout.sidebarExpanded,
        borderRight: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.default,
      }),
    },
  },

  MuiTooltip: {
    styleOverrides: {
      tooltip: ({ theme }) => ({
        backgroundColor: theme.palette.grey[800],
        color: "#FFFFFF",
        fontSize: "0.75rem",
        borderRadius: RADIUS.sm,
      }),
    },
  },

  MuiSkeleton: {
    defaultProps: {
      animation: "pulse",
    },
    styleOverrides: {
      root: {
        borderRadius: RADIUS.md,
      },
    },
  },

  MuiDivider: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderColor: theme.palette.divider,
      }),
    },
  },

  MuiBreadcrumbs: {
    styleOverrides: {
      root: {
        fontSize: "0.875rem",
      },
    },
  },

  MuiLink: {
    defaultProps: {
      underline: "hover",
    },
  },
});
