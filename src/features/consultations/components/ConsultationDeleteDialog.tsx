import ConfirmDialog from "../../../components/ui/ConfirmDialog";
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
  <ConfirmDialog
    open={Boolean(consultation)}
    title="Cancel Consultation?"
    message={
      <>
        Cancel consultation <strong>{consultation?.visitNumber}</strong> for{" "}
        <strong>{consultation?.patientName}</strong>?
      </>
    }
    confirmLabel="Cancel Consultation"
    confirmingLabel="Cancelling…"
    isPending={isDeleting}
    onConfirm={onConfirm}
    onClose={onClose}
  />
);

export default ConsultationDeleteDialog;
