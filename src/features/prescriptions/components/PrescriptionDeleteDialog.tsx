import ConfirmDialog from "../../../components/ui/ConfirmDialog";
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
  <ConfirmDialog
    open={Boolean(prescription)}
    title="Delete Prescription?"
    message={
      <>
        Delete prescription for <strong>{prescription?.patientName}</strong>
        {prescription?.consultationVisitNumber ? ` (Visit ${prescription.consultationVisitNumber})` : ""}? This action
        cannot be undone.
      </>
    }
    confirmLabel="Delete"
    confirmingLabel="Deleting…"
    isPending={isDeleting}
    onConfirm={onConfirm}
    onClose={onClose}
  />
);

export default PrescriptionDeleteDialog;
