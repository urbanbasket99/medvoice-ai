import Badge from "@mui/material/Badge";
import type { BadgeProps } from "@mui/material/Badge";

export interface NotificationBadgeProps extends BadgeProps {
  count: number;
}

const NotificationBadge = ({ count, children, ...rest }: NotificationBadgeProps) => (
  <Badge
    badgeContent={count > 99 ? "99+" : count}
    color="error"
    invisible={count === 0}
    {...rest}
  >
    {children}
  </Badge>
);

export default NotificationBadge;
