import { Alert, Snackbar } from "@mui/material";

import type { PrescriptionSnackbarState } from "../hooks/usePrescriptionSnackbar";

const PrescriptionSnackbar = ({
  state,
  onClose,
}: {
  state: PrescriptionSnackbarState;
  onClose: () => void;
}) => (
  <Snackbar open={state.open} autoHideDuration={5000} onClose={onClose} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
    <Alert onClose={onClose} severity={state.severity} variant="filled" sx={{ width: "100%" }}>
      {state.message}
    </Alert>
  </Snackbar>
);

export default PrescriptionSnackbar;
