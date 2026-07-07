import { Alert, Snackbar } from "@mui/material";

import type { BillingSnackbarState } from "../hooks/useBillingSnackbar";

const BillingSnackbar = ({
  state,
  onClose,
}: {
  state: BillingSnackbarState;
  onClose: () => void;
}) => (
  <Snackbar open={state.open} autoHideDuration={5000} onClose={onClose} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
    <Alert onClose={onClose} severity={state.severity} variant="filled" sx={{ width: "100%" }}>
      {state.message}
    </Alert>
  </Snackbar>
);

export default BillingSnackbar;
