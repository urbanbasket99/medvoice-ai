import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

import type { Notification } from "../types/notification.types";
import { TYPE_PALETTE_COLORS } from "../utils/notificationUtils";

export interface NotificationToastProps {
  notification: Notification | null;
  onClose: () => void;
}

const NotificationToast = ({ notification, onClose }: NotificationToastProps) => {
  if (!notification) return null;

  const severity = TYPE_PALETTE_COLORS[notification.notificationType];

  return (
    <Snackbar
      open
      autoHideDuration={5000}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      sx={{ mt: 8 }}
    >
      <Alert
        severity={severity}
        variant="filled"
        onClose={onClose}
        sx={{ maxWidth: 360, boxShadow: 4 }}
      >
        <AlertTitle sx={{ fontWeight: 600, mb: 0.25 }}>{notification.title}</AlertTitle>
        {notification.message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationToast;
