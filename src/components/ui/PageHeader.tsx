import type { ReactNode } from "react";
import { Box, Stack, Typography } from "@mui/material";

export interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  backAction?: ReactNode;
}

const PageHeader = ({ title, subtitle, actions, backAction }: PageHeaderProps) => (
  <Stack spacing={backAction ? 1.5 : 0}>
    {backAction}
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
    >
      <Box>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
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
