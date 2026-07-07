import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

import type { Consultation } from "../types/consultation.types";

const ConsultationDeleteDialog = ({
  consultation,
  isDeleting,
  onConfirm,
  onClose,
}: {
  consultation: Consultation | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) => (
  <Dialog open={Boolean(consultation)} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>Cancel Consultation</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Cancel consultation <strong>{consultation?.visitNumber}</strong> for{" "}
        <strong>{consultation?.patientName}</strong>?
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} disabled={isDeleting}>
        Keep
      </Button>
      <Button color="error" variant="contained" onClick={onConfirm} disabled={isDeleting}>
        {isDeleting ? "Cancelling…" : "Cancel Consultation"}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConsultationDeleteDialog;
