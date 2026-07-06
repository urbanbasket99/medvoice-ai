import type { ReactNode } from "react";
import { AppBar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export interface HeaderProps {
  title?: ReactNode;
  logo?: ReactNode;
  isMobile: boolean;
  collapsed: boolean;
  onMenuClick: () => void;
  onCollapseClick: () => void;
  actions?: ReactNode;
}

/**
 * Fixed top app bar. On mobile the leading icon opens the temporary
 * sidebar drawer; on desktop/tablet it toggles the permanent sidebar's
 * collapsed state. No app-specific content is hardcoded — `title`, `logo`
 * and `actions` are all supplied by the consumer.
 */
const Header = ({
  title,
  logo,
  isMobile,
  collapsed,
  onMenuClick,
  onCollapseClick,
  actions,
}: HeaderProps) => (
  <AppBar position="fixed" sx={(theme) => ({ zIndex: theme.zIndex.drawer + 1 })}>
    <Toolbar sx={{ gap: 1 }}>
      <IconButton
        edge="start"
        color="inherit"
        onClick={isMobile ? onMenuClick : onCollapseClick}
        aria-label={isMobile ? "Open navigation" : "Toggle sidebar"}
      >
        {isMobile ? (
          <MenuIcon />
        ) : collapsed ? (
          <ChevronRightIcon />
        ) : (
          <ChevronLeftIcon />
        )}
      </IconButton>

      {logo}

      {title && (
        <Typography variant="h6" component="div" noWrap sx={{ ml: logo ? 1 : 0 }}>
          {title}
        </Typography>
      )}

      <Box sx={{ flexGrow: 1 }} />

      {actions && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>{actions}</Box>
      )}
    </Toolbar>
  </AppBar>
);

export default Header;
