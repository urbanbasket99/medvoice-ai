import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

import type { RadiologyOrder } from "../types/radiology.types";

const RadiologyOrderDeleteDialog = ({
  radiologyOrder,
  isDeleting,
  onConfirm,
  onClose,
}: {
  radiologyOrder: RadiologyOrder | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) => (
  <Dialog open={Boolean(radiologyOrder)} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>Delete Radiology Order</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Delete radiology order <strong>{radiologyOrder?.orderNumber}</strong> for <strong>{radiologyOrder?.patientName}</strong>
        {radiologyOrder?.consultationVisitNumber ? ` (Visit ${radiologyOrder.consultationVisitNumber})` : ""}? This action cannot
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

export default RadiologyOrderDeleteDialog;
