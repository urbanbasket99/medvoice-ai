import { useCallback, useState } from "react";

export type SnackbarSeverity = "success" | "error";

export interface AppointmentSnackbarState {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
}

const CLOSED: AppointmentSnackbarState = { open: false, message: "", severity: "success" };

export const useAppointmentSnackbar = () => {
  const [snackbar, setSnackbar] = useState<AppointmentSnackbarState>(CLOSED);
  const showSuccess = useCallback((message: string) => setSnackbar({ open: true, message, severity: "success" }), []);
  const showError = useCallback((message: string) => setSnackbar({ open: true, message, severity: "error" }), []);
  const closeSnackbar = useCallback(() => setSnackbar((prev) => ({ ...prev, open: false })), []);
  return { snackbar, showSuccess, showError, closeSnackbar };
};
