import type { ComponentType } from "react";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import ScienceRoundedIcon from "@mui/icons-material/ScienceRounded";
import MedicalServicesRoundedIcon from "@mui/icons-material/MedicalServicesRounded";
import LocalPharmacyRoundedIcon from "@mui/icons-material/LocalPharmacyRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import type { SvgIconProps } from "@mui/material/SvgIcon";

import type { NotificationSeverity, NotificationType } from "../types/notification.types";

export type IconComponent = ComponentType<SvgIconProps>;

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  success: "Success",
  error: "Error",
  warning: "Warning",
  information: "Information",
  appointment_reminder: "Appointment Reminder",
  billing_reminder: "Billing Reminder",
  lab_result: "Lab Result",
  radiology_result: "Radiology Result",
  low_stock: "Low Stock",
  system_alert: "System Alert",
};

export const NOTIFICATION_TYPE_ICONS: Record<NotificationType, IconComponent> = {
  success: CheckCircleRoundedIcon,
  error: ErrorRoundedIcon,
  warning: WarningRoundedIcon,
  information: InfoRoundedIcon,
  appointment_reminder: EventRoundedIcon,
  billing_reminder: ReceiptLongRoundedIcon,
  lab_result: ScienceRoundedIcon,
  radiology_result: MedicalServicesRoundedIcon,
  low_stock: LocalPharmacyRoundedIcon,
  system_alert: NotificationsRoundedIcon,
};

export const TYPE_PALETTE_COLORS: Record<
  NotificationType,
  "success" | "error" | "warning" | "info"
> = {
  success: "success",
  error: "error",
  warning: "warning",
  information: "info",
  appointment_reminder: "info",
  billing_reminder: "warning",
  lab_result: "info",
  radiology_result: "info",
  low_stock: "warning",
  system_alert: "error",
};

export const SEVERITY_PALETTE_COLORS: Record<
  NotificationSeverity,
  "success" | "error" | "warning" | "info"
> = {
  low: "info",
  medium: "warning",
  high: "error",
  critical: "error",
};

export const formatRelativeTime = (isoString: string): string => {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Date(isoString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: diffDays > 365 ? "numeric" : undefined,
  });
};
