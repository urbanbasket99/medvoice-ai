import type { SxProps, Theme } from "@mui/material";

export const dataGridSx: SxProps<Theme> = {
  border: 0,
  bgcolor: "background.paper",
  "& .MuiDataGrid-row:hover": {
    bgcolor: "action.hover",
  },
};

export const dataGridSlotProps = {
  loadingOverlay: { variant: "skeleton" as const, noRowsVariant: "skeleton" as const },
};
