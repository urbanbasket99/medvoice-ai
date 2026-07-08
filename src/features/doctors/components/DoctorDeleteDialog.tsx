import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import type { Doctor } from "../types/doctor.types";

export interface DoctorDeleteDialogProps {
  doctor: Doctor | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const DoctorDeleteDialog = ({ doctor, isDeleting, onConfirm, onClose }: DoctorDeleteDialogProps) => (
  <ConfirmDialog
    open={Boolean(doctor)}
    title="Deactivate Doctor?"
    message={
      <>
        Are you sure you want to deactivate <strong>{doctor?.fullName}</strong> ({doctor?.doctorCode})? This doctor
        will no longer appear in active listings.
      </>
    }
    confirmLabel="Deactivate"
    confirmingLabel="Deactivating…"
    isPending={isDeleting}
    onConfirm={onConfirm}
    onClose={onClose}
  />
);

export default DoctorDeleteDialog;
