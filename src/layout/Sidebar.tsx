import type { ReactNode } from "react";
import { Box, Drawer } from "@mui/material";
import Navigation from "./Navigation";
import type { NavItem } from "./Navigation";

export interface SidebarProps {
  items: NavItem[];
  activeId?: string;
  onItemClick?: (item: NavItem) => void;
  collapsed: boolean;
  isMobile: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
  header?: ReactNode;
}

/**
 * Responsive drawer shell around `Navigation`. Renders as a permanent,
 * width-collapsible drawer on desktop/tablet and as a temporary overlay
 * drawer on mobile. All sizing comes from `theme.layout` tokens.
 */
const Sidebar = ({
  items,
  activeId,
  onItemClick,
  collapsed,
  isMobile,
  mobileOpen,
  onMobileClose,
  header,
}: SidebarProps) => {
  const isCollapsedRail = collapsed && !isMobile;

  const content = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {header && (
        <Box
          sx={(theme) => ({
            height: theme.layout.headerHeight,
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsedRail ? "center" : "flex-start",
            px: 2,
            flexShrink: 0,
          })}
        >
          {header}
        </Box>
      )}
      <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", py: 1 }}>
        <Navigation
          items={items}
          activeId={activeId}
          onItemClick={onItemClick}
          collapsed={isCollapsedRail}
        />
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? mobileOpen : true}
      onClose={onMobileClose}
      ModalProps={{ keepMounted: true }}
      sx={(theme) => ({
        width: isMobile
          ? theme.layout.sidebarExpanded
          : isCollapsedRail
            ? theme.layout.sidebarCollapsed
            : theme.layout.sidebarExpanded,
        flexShrink: 0,
        whiteSpace: "nowrap",
        "& .MuiDrawer-paper": {
          width: isMobile
            ? theme.layout.sidebarExpanded
            : isCollapsedRail
              ? theme.layout.sidebarCollapsed
              : theme.layout.sidebarExpanded,
          boxSizing: "border-box",
          borderRight: `1px solid ${theme.palette.divider}`,
          overflowX: "hidden",
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      })}
    >
      {content}
    </Drawer>
  );
};

export default Sidebar;
