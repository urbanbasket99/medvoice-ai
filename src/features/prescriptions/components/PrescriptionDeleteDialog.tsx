import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

import type { Prescription } from "../types/prescription.types";

const PrescriptionDeleteDialog = ({
  prescription,
  isDeleting,
  onConfirm,
  onClose,
}: {
  prescription: Prescription | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) => (
  <Dialog open={Boolean(prescription)} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>Delete Prescription</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Delete prescription for <strong>{prescription?.patientName}</strong>
        {prescription?.consultationVisitNumber ? ` (Visit ${prescription.consultationVisitNumber})` : ""}? This action
        cannot be undone.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} disabled={isDeleting}>
        Cancel
      </Button>
      <Button color="error" variant="contained" onClick={onConfirm} disabled={isDeleting}>
        {isDeleting ? "Deleting…" : "Delete"}
      </Button>
    </DialogActions>
  </Dialog>
);

export default PrescriptionDeleteDialog;
