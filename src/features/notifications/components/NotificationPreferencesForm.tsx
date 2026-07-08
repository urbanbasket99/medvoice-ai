import type { ChangeEvent } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "../hooks/useNotificationPreferences";
import type { UpdateNotificationPreferencesPayload } from "../types/notification.types";

const NotificationPreferencesForm = () => {
  const { data: prefs, isLoading, isError } = useNotificationPreferences();
  const update = useUpdateNotificationPreferences();

  const toggle =
    (field: keyof UpdateNotificationPreferencesPayload) =>
    (_: ChangeEvent<HTMLInputElement>, checked: boolean) => {
      update.mutate({ [field]: checked });
    };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (isError || !prefs) {
    return <Alert severity="error">Failed to load notification preferences.</Alert>;
  }

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        Delivery Channels
      </Typography>
      <FormGroup>
        {(
          [
            { field: "emailEnabled", label: "Email" },
            { field: "pushEnabled", label: "Push Notifications" },
            { field: "smsEnabled", label: "SMS" },
          ] as const
        ).map(({ field, label }) => (
          <FormControlLabel
            key={field}
            control={
              <Switch
                checked={prefs[field]}
                onChange={toggle(field)}
                disabled={update.isPending}
                size="small"
              />
            }
            label={label}
          />
        ))}
      </FormGroup>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        Notification Types
      </Typography>
      <FormGroup>
        {(
          [
            { field: "appointmentReminders", label: "Appointment Reminders" },
            { field: "billingReminders", label: "Billing Reminders" },
            { field: "labResults", label: "Lab Results" },
            { field: "radiologyResults", label: "Radiology Results" },
            { field: "lowStockAlerts", label: "Low Stock Alerts" },
            { field: "systemAlerts", label: "System Alerts" },
          ] as const
        ).map(({ field, label }) => (
          <FormControlLabel
            key={field}
            control={
              <Switch
                checked={prefs[field]}
                onChange={toggle(field)}
                disabled={update.isPending}
                size="small"
              />
            }
            label={label}
          />
        ))}
      </FormGroup>
    </Box>
  );
};

export default NotificationPreferencesForm;
