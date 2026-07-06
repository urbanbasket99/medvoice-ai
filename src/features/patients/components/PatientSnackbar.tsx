import { Alert, Snackbar } from "@mui/material";

import type { PatientSnackbarState } from "../hooks/usePatientSnackbar";

export interface PatientSnackbarProps {
  state: PatientSnackbarState;
  onClose: () => void;
}

const PatientSnackbar = ({ state, onClose }: PatientSnackbarProps) => (
  <Snackbar
    open={state.open}
    autoHideDuration={4000}
    onClose={onClose}
    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
  >
    <Alert onClose={onClose} severity={state.severity} variant="filled" sx={{ width: "100%" }}>
      {state.message}
    </Alert>
  </Snackbar>
);

export default PatientSnackbar;
