import type { ReactNode } from "react";
import { Box, Breadcrumbs as MuiBreadcrumbs, Link, Typography } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";

export interface BreadcrumbItem {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHomeIcon?: boolean;
}

/**
 * Presentational breadcrumb strip. Renders nothing when `items` is empty so
 * consumers can pass an optional trail without conditional wrapping.
 */
const Breadcrumbs = ({ items, showHomeIcon = true }: BreadcrumbsProps) => {
  if (items.length === 0) return null;

  return (
    <Box
      sx={(theme) => ({
        px: { xs: 2, sm: 3 },
        py: 1.5,
        minHeight: theme.layout.breadcrumbHeight,
        display: "flex",
        alignItems: "center",
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
      })}
    >
      <MuiBreadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const icon =
            index === 0 && showHomeIcon ? (
              <HomeOutlinedIcon fontSize="inherit" sx={{ mr: 0.5, verticalAlign: "middle" }} />
            ) : (
              item.icon
            );

          if (isLast || (!item.href && !item.onClick)) {
            return (
              <Typography
                key={item.id}
                color="text.primary"
                variant="body2"
                sx={{ display: "flex", alignItems: "center", fontWeight: 600 }}
              >
                {icon}
                {item.label}
              </Typography>
            );
          }

          return (
            <Link
              key={item.id}
              underline="hover"
              color="text.secondary"
              variant="body2"
              href={item.href}
              onClick={item.onClick}
              sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            >
              {icon}
              {item.label}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
};

export default Breadcrumbs;
