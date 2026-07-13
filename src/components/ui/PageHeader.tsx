import type { ReactNode } from "react";
import { Box, Stack, Typography } from "@mui/material";

export interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  backAction?: ReactNode;
  /** When true (default), header sticks below the app bar while scrolling. */
  sticky?: boolean;
}

const PageHeader = ({
  title,
  subtitle,
  actions,
  backAction,
  sticky = true,
}: PageHeaderProps) => (
  <Stack
    spacing={backAction ? 1.5 : 0}
    sx={
      sticky
        ? {
            position: "sticky",
            top: 0,
            zIndex: 2,
            bgcolor: "background.default",
            pt: 0.5,
            pb: 1.5,
            mb: 0.5,
          }
        : undefined
    }
  >
    {backAction}
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
    >
      <Box>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700, letterSpacing: "-0.01em" }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {actions ? (
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          {actions}
        </Stack>
      ) : null}
    </Stack>
  </Stack>
);

export default PageHeader;
