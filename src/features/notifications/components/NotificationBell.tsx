import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";

import NotificationBadge from "./NotificationBadge";
import NotificationDrawer from "./NotificationDrawer";
import { useUnreadCount } from "../hooks/useUnreadCount";

const NotificationBell = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data } = useUnreadCount();
  const count = data?.count ?? 0;

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          size="small"
          aria-label={count > 0 ? `Notifications, ${count} unread` : "Notifications"}
          onClick={() => setDrawerOpen(true)}
        >
          <NotificationBadge count={count}>
            <NotificationsRoundedIcon fontSize="small" />
          </NotificationBadge>
        </IconButton>
      </Tooltip>

      <NotificationDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
};

export default NotificationBell;
