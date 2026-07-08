import { Alert, Snackbar } from "@mui/material";

export interface AppSnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
}

export interface AppSnackbarProps {
  state: AppSnackbarState;
  onClose: () => void;
}

const AppSnackbar = ({ state, onClose }: AppSnackbarProps) => (
  <Snackbar
    open={state.open}
    autoHideDuration={5000}
    onClose={onClose}
    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
  >
    <Alert onClose={onClose} severity={state.severity} variant="filled" sx={{ width: "100%" }}>
      {state.message}
    </Alert>
  </Snackbar>
);

export default AppSnackbar;
