import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import type { Patient } from "../types/patient.types";

export interface PatientDeleteDialogProps {
  patient: Patient | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const PatientDeleteDialog = ({ patient, isDeleting, onConfirm, onClose }: PatientDeleteDialogProps) => (
  <ConfirmDialog
    open={Boolean(patient)}
    title="Deactivate Patient?"
    message={
      patient
        ? `This will deactivate ${patient.fullName} (UHID ${patient.uhid}). The record is soft-deleted — it can be restored by an administrator and is never permanently erased.`
        : null
    }
    confirmLabel="Deactivate"
    confirmingLabel="Deactivating…"
    isPending={isDeleting}
    onConfirm={onConfirm}
    onClose={onClose}
  />
);

export default PatientDeleteDialog;
