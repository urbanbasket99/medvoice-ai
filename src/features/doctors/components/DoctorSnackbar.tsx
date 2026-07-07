import { Alert, Snackbar } from "@mui/material";

import type { DoctorSnackbarState } from "../hooks/useDoctorSnackbar";

export interface DoctorSnackbarProps {
  state: DoctorSnackbarState;
  onClose: () => void;
}

const DoctorSnackbar = ({ state, onClose }: DoctorSnackbarProps) => (
  <Snackbar open={state.open} autoHideDuration={5000} onClose={onClose} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
    <Alert onClose={onClose} severity={state.severity} variant="filled" sx={{ width: "100%" }}>
      {state.message}
    </Alert>
  </Snackbar>
);

export default DoctorSnackbar;
