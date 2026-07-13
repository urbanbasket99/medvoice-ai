import type { ReactNode } from "react";
import { Box, Stack, Typography } from "@mui/material";

import { APP_NAME, APP_VERSION } from "../lib/appMeta";

export interface FooterProps {
  children?: ReactNode;
}

const Footer = ({ children }: FooterProps) => {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={(theme) => ({
        flexShrink: 0,
        px: { xs: 2, sm: 3 },
        py: 1.5,
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
      })}
    >
      {children ?? (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={0.5}
          sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}
        >
          <Typography variant="caption" color="text.secondary">
            © {year} {APP_NAME}. All rights reserved.
          </Typography>
          <Typography variant="caption" color="text.disabled">
            Version {APP_VERSION}
          </Typography>
        </Stack>
      )}
    </Box>
  );
};

export default Footer;
