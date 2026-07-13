import type { SxProps, Theme } from "@mui/material";

export const dataGridSx: SxProps<Theme> = {
  border: 0,
  bgcolor: "background.paper",
  borderRadius: 0,
  "& .MuiDataGrid-columnHeaders": {
    bgcolor: "surfaces.sunken",
    borderBottom: 1,
    borderColor: "divider",
    minHeight: "44px !important",
    maxHeight: "44px !important",
  },
  "& .MuiDataGrid-columnHeader": {
    "&:focus, &:focus-within": { outline: "none" },
  },
  "& .MuiDataGrid-columnHeaderTitle": {
    fontWeight: 600,
    fontSize: "0.6875rem",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "text.secondary",
  },
  "& .MuiDataGrid-row": {
    transition: "background-color 0.15s ease",
    cursor: "pointer",
  },
  "& .MuiDataGrid-row:hover": {
    bgcolor: "action.hover",
  },
  "& .MuiDataGrid-row.Mui-selected": {
    bgcolor: "action.selected",
    "&:hover": { bgcolor: "action.selected" },
  },
  "& .MuiDataGrid-cell": {
    borderColor: "divider",
    fontSize: "0.875rem",
    py: 1,
  },
  "& .MuiDataGrid-footerContainer": {
    borderTop: 1,
    borderColor: "divider",
    minHeight: 52,
  },
  "& .MuiDataGrid-scrollbar": {
    "&::-webkit-scrollbar": { width: 6, height: 6 },
    "&::-webkit-scrollbar-thumb": {
      bgcolor: "grey.300",
      borderRadius: 3,
    },
  },
};

export const enterpriseDataGridSx: SxProps<Theme> = {
  ...dataGridSx,
  "& .MuiDataGrid-columnHeaders": {
    ...((dataGridSx as Record<string, unknown>)["& .MuiDataGrid-columnHeaders"] as object),
    position: "sticky",
    top: 0,
    zIndex: 2,
  },
};

export const dataGridSlotProps = {
  loadingOverlay: { variant: "skeleton" as const, noRowsVariant: "skeleton" as const },
};
