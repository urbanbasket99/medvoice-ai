import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

import type { Doctor } from "../types/doctor.types";

export interface DoctorDeleteDialogProps {
  doctor: Doctor | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const DoctorDeleteDialog = ({ doctor, isDeleting, onConfirm, onClose }: DoctorDeleteDialogProps) => (
  <Dialog open={Boolean(doctor)} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>Deactivate Doctor</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Are you sure you want to deactivate <strong>{doctor?.fullName}</strong> ({doctor?.doctorCode})?
        This doctor will no longer appear in active listings.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} disabled={isDeleting}>
        Cancel
      </Button>
      <Button color="error" variant="contained" onClick={onConfirm} disabled={isDeleting}>
        {isDeleting ? "Deactivating…" : "Deactivate"}
      </Button>
    </DialogActions>
  </Dialog>
);

export default DoctorDeleteDialog;
