import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

import type { LabOrder } from "../types/laboratory.types";

const LabOrderDeleteDialog = ({
  labOrder,
  isDeleting,
  onConfirm,
  onClose,
}: {
  labOrder: LabOrder | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) => (
  <Dialog open={Boolean(labOrder)} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>Delete Lab Order</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Delete lab order <strong>{labOrder?.orderNumber}</strong> for <strong>{labOrder?.patientName}</strong>
        {labOrder?.consultationVisitNumber ? ` (Visit ${labOrder.consultationVisitNumber})` : ""}? This action cannot
        be undone.
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

export default LabOrderDeleteDialog;
