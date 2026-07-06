import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
} from "@mui/material";

import type { Patient } from "../types/patient.types";

export interface PatientDeleteDialogProps {
  patient: Patient | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Confirms a (soft) delete/deactivation before it fires — `patient` being
 * `null` means "closed"; passing the target patient in opens the dialog.
 * Deletion in this bounded context is always a soft delete (see
 * `DeletePatientUseCase`), the copy reflects that explicitly.
 */
const PatientDeleteDialog = ({ patient, isDeleting, onConfirm, onClose }: PatientDeleteDialogProps) => (
  <Dialog open={Boolean(patient)} onClose={isDeleting ? undefined : onClose} maxWidth="xs" fullWidth>
    <DialogTitle>Deactivate patient?</DialogTitle>
    <DialogContent>
      <DialogContentText>
        {patient
          ? `This will deactivate ${patient.fullName} (UHID ${patient.uhid}). The record is soft-deleted — it can be restored by an administrator and is never permanently erased.`
          : null}
      </DialogContentText>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2 }}>
      <Button onClick={onClose} disabled={isDeleting}>
        Cancel
      </Button>
      <Button
        onClick={onConfirm}
        color="error"
        variant="contained"
        disabled={isDeleting}
        startIcon={isDeleting ? <CircularProgress size={16} color="inherit" /> : undefined}
      >
        {isDeleting ? "Deactivating\u2026" : "Deactivate"}
      </Button>
    </DialogActions>
  </Dialog>
);

export default PatientDeleteDialog;
