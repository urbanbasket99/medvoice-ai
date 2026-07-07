import { useCallback, useState } from "react";

export type SnackbarSeverity = "success" | "error";

export interface BillingSnackbarState {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
}

const CLOSED: BillingSnackbarState = { open: false, message: "", severity: "success" };

export const useBillingSnackbar = () => {
  const [snackbar, setSnackbar] = useState<BillingSnackbarState>(CLOSED);
  const showSuccess = useCallback((message: string) => setSnackbar({ open: true, message, severity: "success" }), []);
  const showError = useCallback((message: string) => setSnackbar({ open: true, message, severity: "error" }), []);
  const closeSnackbar = useCallback(() => setSnackbar((prev) => ({ ...prev, open: false })), []);
  return { snackbar, showSuccess, showError, closeSnackbar };
};
