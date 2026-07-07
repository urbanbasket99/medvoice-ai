import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

import type { DispenseRecord } from "../types/pharmacy.types";
import type { PharmacyMedicine } from "../types/pharmacy.types";

export const DispenseDeleteDialog = ({
  dispense,
  isDeleting,
  onConfirm,
  onClose,
}: {
  dispense: DispenseRecord | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) => (
  <Dialog open={Boolean(dispense)} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>Delete Dispense Record</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Delete dispense <strong>{dispense?.orderNumber}</strong> for <strong>{dispense?.patientName}</strong>
        {dispense?.consultationVisitNumber ? ` (Visit ${dispense.consultationVisitNumber})` : ""}? This action
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

export const MedicineDeleteDialog = ({
  medicine,
  isDeleting,
  onConfirm,
  onClose,
}: {
  medicine: PharmacyMedicine | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) => (
  <Dialog open={Boolean(medicine)} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>Delete Medicine</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Delete medicine <strong>{medicine?.brandName}</strong> ({medicine?.medicineCode})? This action cannot be
        undone.
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

export default DispenseDeleteDialog;
