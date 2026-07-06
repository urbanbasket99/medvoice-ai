import { useCallback, useState } from "react";
import type { AlertColor } from "@mui/material";

export interface PatientSnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

const INITIAL_STATE: PatientSnackbarState = { open: false, message: "", severity: "success" };

/**
 * Local (per-page) success/error toast state — kept inside the `patients`
 * feature rather than a shared/global notification system, since none
 * exists elsewhere in the app yet and introducing one is out of scope for
 * this module.
 */
export const usePatientSnackbar = () => {
  const [snackbar, setSnackbar] = useState<PatientSnackbarState>(INITIAL_STATE);

  const showSuccess = useCallback((message: string) => {
    setSnackbar({ open: true, message, severity: "success" });
  }, []);

  const showError = useCallback((message: string) => {
    setSnackbar({ open: true, message, severity: "error" });
  }, []);

  const closeSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  return { snackbar, showSuccess, showError, closeSnackbar };
};
