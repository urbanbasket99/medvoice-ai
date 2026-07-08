import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import DoneRoundedIcon from "@mui/icons-material/DoneRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";

import type { Notification } from "../types/notification.types";
import {
  NOTIFICATION_TYPE_ICONS,
  NOTIFICATION_TYPE_LABELS,
  TYPE_PALETTE_COLORS,
  formatRelativeTime,
} from "../utils/notificationUtils";
import {
  useMarkNotificationRead,
  useDeleteNotification,
} from "../hooks/useNotificationMutations";

export interface NotificationCardProps {
  notification: Notification;
  compact?: boolean;
}

const NotificationCard = ({ notification, compact = false }: NotificationCardProps) => {
  const navigate = useNavigate();
  const markRead = useMarkNotificationRead();
  const deleteNotif = useDeleteNotification();

  const TypeIcon = NOTIFICATION_TYPE_ICONS[notification.notificationType];
  const color = TYPE_PALETTE_COLORS[notification.notificationType];
  const label = NOTIFICATION_TYPE_LABELS[notification.notificationType];

  const handleActionClick = () => {
    if (!notification.isRead) markRead.mutate(notification.id);
    if (notification.actionUrl) navigate(notification.actionUrl);
  };

  return (
    <Card
      variant="outlined"
      sx={{
        mb: 1,
        opacity: notification.isRead ? 0.72 : 1,
        borderLeftWidth: notification.isRead ? 1 : 3,
        borderLeftColor: notification.isRead ? "divider" : `${color}.main`,
        bgcolor: notification.isRead ? "background.paper" : "action.hover",
        transition: "opacity 0.2s, border-left-color 0.2s",
      }}
    >
      <CardContent
        sx={{
          py: compact ? 1 : 1.5,
          px: compact ? 1.5 : 2,
          "&:last-child": { pb: compact ? 1 : 1.5 },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
          <Box sx={{ color: `${color}.main`, mt: 0.25, flexShrink: 0, display: "flex" }}>
            <TypeIcon fontSize="small" />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.25 }}>
              <Typography
                variant="body2"
                fontWeight={notification.isRead ? 400 : 600}
                noWrap
                sx={{ flex: 1 }}
              >
                {notification.title}
              </Typography>
              {!compact && (
                <Chip
                  label={label}
                  size="small"
                  color={color}
                  variant="outlined"
                  sx={{ fontSize: 10, height: 18 }}
                />
              )}
            </Box>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: compact ? 1 : 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {notification.message}
            </Typography>

            <Typography variant="caption" color="text.disabled" sx={{ display: "block", mt: 0.5 }}>
              {formatRelativeTime(notification.createdAt)}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25, flexShrink: 0 }}>
            {!notification.isRead && (
              <Tooltip title="Mark as read">
                <span>
                  <IconButton
                    size="small"
                    onClick={() => markRead.mutate(notification.id)}
                    disabled={markRead.isPending}
                    sx={{ p: 0.5 }}
                  >
                    <DoneRoundedIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </span>
              </Tooltip>
            )}
            {notification.actionUrl && (
              <Tooltip title="Open">
                <IconButton size="small" onClick={handleActionClick} sx={{ p: 0.5 }}>
                  <OpenInNewRoundedIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Delete">
              <span>
                <IconButton
                  size="small"
                  onClick={() => deleteNotif.mutate(notification.id)}
                  disabled={deleteNotif.isPending}
                  sx={{ p: 0.5 }}
                >
                  <DeleteRoundedIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default NotificationCard;
