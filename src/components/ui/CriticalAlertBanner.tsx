import type { ReactNode } from "react";
import { Alert, AlertTitle } from "@mui/material";

export interface CriticalAlertBannerProps {
  title: string;
  message: ReactNode;
  severity?: "error" | "warning" | "info";
  action?: ReactNode;
}

const CriticalAlertBanner = ({
  title,
  message,
  severity = "error",
  action,
}: CriticalAlertBannerProps) => (
  <Alert
    severity={severity}
    variant="filled"
    action={action}
    sx={{ borderRadius: 2.5, alignItems: "center" }}
  >
    <AlertTitle sx={{ fontWeight: 700, mb: 0.25 }}>{title}</AlertTitle>
    {message}
  </Alert>
);

export default CriticalAlertBanner;
