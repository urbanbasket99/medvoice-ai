import { Alert, Snackbar } from "@mui/material";

import type { LabOrderSnackbarState } from "../hooks/useLabOrderSnackbar";

const LabOrderSnackbar = ({
  state,
  onClose,
}: {
  state: LabOrderSnackbarState;
  onClose: () => void;
}) => (
  <Snackbar open={state.open} autoHideDuration={5000} onClose={onClose} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
    <Alert onClose={onClose} severity={state.severity} variant="filled" sx={{ width: "100%" }}>
      {state.message}
    </Alert>
  </Snackbar>
);

export default LabOrderSnackbar;
