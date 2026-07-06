import type { ReactNode } from "react";
import { Box, Typography } from "@mui/material";

export interface FooterProps {
  children?: ReactNode;
}

/**
 * Sticky footer: sits at the bottom of the scroll container, pushed below
 * short content and scrolled into view below long content (classic
 * flex-column "sticky footer" pattern — see AppLayout for the container).
 */
const Footer = ({ children }: FooterProps) => {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={(theme) => ({
        flexShrink: 0,
        px: { xs: 2, sm: 3 },
        py: 2,
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
      })}
    >
      {children ?? (
        <Typography variant="caption" color="text.secondary">
          © {year}. All rights reserved.
        </Typography>
      )}
    </Box>
  );
};

export default Footer;
