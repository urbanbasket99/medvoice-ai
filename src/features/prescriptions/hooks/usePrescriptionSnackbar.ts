import { useCallback, useState } from "react";

export type SnackbarSeverity = "success" | "error";

export interface PrescriptionSnackbarState {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
}

const CLOSED: PrescriptionSnackbarState = { open: false, message: "", severity: "success" };

export const usePrescriptionSnackbar = () => {
  const [snackbar, setSnackbar] = useState<PrescriptionSnackbarState>(CLOSED);
  const showSuccess = useCallback((message: string) => setSnackbar({ open: true, message, severity: "success" }), []);
  const showError = useCallback((message: string) => setSnackbar({ open: true, message, severity: "error" }), []);
  const closeSnackbar = useCallback(() => setSnackbar((prev) => ({ ...prev, open: false })), []);
  return { snackbar, showSuccess, showError, closeSnackbar };
};
