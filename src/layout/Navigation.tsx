import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export interface NavItem {
  id: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: ReactNode;
  children?: NavItem[];
}

export interface NavigationProps {
  items: NavItem[];
  activeId?: string;
  collapsed?: boolean;
  onItemClick?: (item: NavItem) => void;
  depth?: number;
}

function findAncestorIds(
  items: NavItem[],
  targetId: string,
  trail: string[] = []
): string[] | null {
  for (const item of items) {
    if (item.id === targetId) return trail;
    if (item.children?.length) {
      const found = findAncestorIds(item.children, targetId, [...trail, item.id]);
      if (found) return found;
    }
  }
  return null;
}

function hasActiveDescendant(item: NavItem, activeId?: string): boolean {
  if (!activeId) return false;
  if (item.id === activeId) return true;
  return item.children?.some((child) => hasActiveDescendant(child, activeId)) ?? false;
}

/**
 * Renders a (optionally nested) list of navigation items. Purely
 * presentational — routing/state decisions belong to the consumer via
 * `onItemClick`, `href` or `onClick` on each item.
 */
const Navigation = ({
  items,
  activeId,
  collapsed = false,
  onItemClick,
  depth = 0,
}: NavigationProps) => {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});

  const ancestorIds = useMemo(
    () => (activeId ? findAncestorIds(items, activeId) ?? [] : []),
    [items, activeId]
  );

  useEffect(() => {
    if (!ancestorIds.length) return;
    setOpenIds((prev) => {
      const next = { ...prev };
      for (const id of ancestorIds) next[id] = true;
      return next;
    });
  }, [ancestorIds]);

  const toggleOpen = (id: string) =>
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <List disablePadding component="nav">
      {items.map((item) => {
        const hasChildren = Boolean(item.children?.length);
        const isActive = item.id === activeId;
        const childActive = hasActiveDescendant(item, activeId) && !isActive;
        const isOpen = openIds[item.id] ?? false;

        const buttonNode = (
          <ListItemButton
            selected={isActive}
            {...(item.href ? ({ component: "a", href: item.href } as const) : {})}
            onClick={() => {
              if (hasChildren) toggleOpen(item.id);
              else item.onClick?.();
              onItemClick?.(item);
            }}
            sx={{
              pl: 2 + depth * 2,
              justifyContent: collapsed ? "center" : "flex-start",
              borderRadius: 1,
              mx: 1,
              mb: 0.5,
              ...(childActive && {
                bgcolor: "action.hover",
              }),
            }}
          >
            {item.icon && (
              <ListItemIcon
                sx={{
                  minWidth: collapsed ? 0 : 40,
                  justifyContent: "center",
                  color: "inherit",
                }}
              >
                {item.icon}
              </ListItemIcon>
            )}
            {!collapsed && <ListItemText primary={item.label} />}
            {!collapsed && item.badge}
            {!collapsed && hasChildren && (
              isOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />
            )}
          </ListItemButton>
        );

        return (
          <div key={item.id}>
            {collapsed ? (
              <Tooltip title={item.label} placement="right">
                {buttonNode}
              </Tooltip>
            ) : (
              buttonNode
            )}
            {hasChildren && !collapsed && (
              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <Navigation
                  items={item.children!}
                  activeId={activeId}
                  onItemClick={onItemClick}
                  depth={depth + 1}
                />
              </Collapse>
            )}
          </div>
        );
      })}
    </List>
  );
};

export default Navigation;
