import { useState } from "react";
import type { ReactNode } from "react";
import { Box, Toolbar, useMediaQuery, useTheme } from "@mui/material";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import Breadcrumbs from "./Breadcrumbs";
import type { NavItem } from "./Navigation";
import type { BreadcrumbItem } from "./Breadcrumbs";

export interface AppLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  activeNavId?: string;
  onNavItemClick?: (item: NavItem) => void;
  breadcrumbs?: BreadcrumbItem[];
  title?: ReactNode;
  logo?: ReactNode;
  headerActions?: ReactNode;
  footer?: ReactNode;
  defaultCollapsed?: boolean;
}

/**
 * Enterprise application shell: fixed header, responsive/collapsible
 * sidebar, optional breadcrumb strip, a scrollable content region and a
 * sticky footer. Purely structural — screens are supplied via `children`
 * and navigation/breadcrumb data via props. No routing, auth or business
 * logic lives here.
 */
const AppLayout = ({
  children,
  navItems,
  activeNavId,
  onNavItemClick,
  breadcrumbs,
  title,
  logo,
  headerActions,
  footer,
  defaultCollapsed = false,
}: AppLayoutProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleItemClick = (item: NavItem) => {
    onNavItemClick?.(item);
    if (isMobile) setMobileOpen(false);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Header
        title={title}
        logo={logo}
        isMobile={isMobile}
        collapsed={collapsed}
        onMenuClick={() => setMobileOpen((prev) => !prev)}
        onCollapseClick={() => setCollapsed((prev) => !prev)}
        actions={headerActions}
      />

      <Sidebar
        items={navItems}
        activeId={activeNavId}
        onItemClick={handleItemClick}
        collapsed={collapsed}
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        header={logo}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          minWidth: 0,
        }}
      >
        <Toolbar />

        {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}

        <Box sx={{ flex: 1, overflowY: "auto", p: { xs: 2, sm: 3 } }}>{children}</Box>

        <Footer>{footer}</Footer>
      </Box>
    </Box>
  );
};

export default AppLayout;
