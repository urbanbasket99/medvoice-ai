import { memo } from "react";
import type { DataGridProps } from "@mui/x-data-grid";
import { DataGrid } from "@mui/x-data-grid";
import { Box } from "@mui/material";

import { dataGridSlotProps, enterpriseDataGridSx } from "./dataGridStyles";

export type EnterpriseDataGridProps = DataGridProps & {
  toolbar?: React.ReactNode;
};

const EnterpriseDataGrid = memo(({ toolbar, sx, ...props }: EnterpriseDataGridProps) => (
  <Box
    sx={(theme) => ({
      border: `1px solid ${theme.surfaces.border}`,
      borderRadius: 2.5,
      overflow: "hidden",
      bgcolor: "background.paper",
      boxShadow: theme.customShadows.card,
    })}
  >
    {toolbar}
    <DataGrid
      disableRowSelectionOnClick
      {...props}
      sx={[enterpriseDataGridSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
      slotProps={{ ...dataGridSlotProps, ...props.slotProps }}
    />
  </Box>
));

EnterpriseDataGrid.displayName = "EnterpriseDataGrid";

export default EnterpriseDataGrid;
