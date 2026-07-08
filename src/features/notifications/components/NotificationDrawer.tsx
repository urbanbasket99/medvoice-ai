import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";

import NotificationCard from "./NotificationCard";
import { notificationsListQueryOptions } from "../api/notificationsQueries";
import { useMarkAllNotificationsRead } from "../hooks/useNotificationMutations";

export interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
}

const DRAWER_WIDTH = 380;

const NotificationDrawer = ({ open, onClose }: NotificationDrawerProps) => {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(
    notificationsListQueryOptions({ page: 1, pageSize: 10 }),
  );
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = data?.items ?? [];
  const hasUnread = notifications.some((n) => !n.isRead);

  const handleViewAll = () => {
    onClose();
    navigate("/notifications");
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: DRAWER_WIDTH, maxWidth: "100vw", display: "flex", flexDirection: "column" } }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", px: 2, py: 1.5, flexShrink: 0 }}>
        <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
          Notifications
        </Typography>
        {hasUnread && (
          <IconButton
            size="small"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            title="Mark all as read"
          >
            <DoneAllRoundedIcon fontSize="small" />
          </IconButton>
        )}
        <IconButton size="small" onClick={onClose} sx={{ ml: 0.5 }}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Box>

      <Divider />

      {/* Body */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 1.5, py: 1 }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 6,
              gap: 1,
            }}
          >
            <NotificationsNoneRoundedIcon sx={{ fontSize: 40, color: "text.disabled" }} />
            <Typography variant="body2" color="text.secondary">
              You're all caught up!
            </Typography>
          </Box>
        ) : (
          notifications.map((n) => <NotificationCard key={n.id} notification={n} compact />)
        )}
      </Box>

      <Divider />

      {/* Footer */}
      <Box sx={{ p: 1.5, flexShrink: 0 }}>
        <Button
          fullWidth
          variant="outlined"
          size="small"
          endIcon={<OpenInNewRoundedIcon fontSize="small" />}
          onClick={handleViewAll}
        >
          View All Notifications
        </Button>
      </Box>
    </Drawer>
  );
};

export default NotificationDrawer;
