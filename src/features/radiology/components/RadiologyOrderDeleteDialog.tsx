import ConfirmDialog from "../../../components/ui/ConfirmDialog";
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
  <ConfirmDialog
    open={Boolean(radiologyOrder)}
    title="Delete Radiology Order?"
    message={
      <>
        Delete radiology order <strong>{radiologyOrder?.orderNumber}</strong> for{" "}
        <strong>{radiologyOrder?.patientName}</strong>
        {radiologyOrder?.consultationVisitNumber ? ` (Visit ${radiologyOrder.consultationVisitNumber})` : ""}? This
        action cannot be undone.
      </>
    }
    confirmLabel="Delete"
    confirmingLabel="Deleting…"
    isPending={isDeleting}
    onConfirm={onConfirm}
    onClose={onClose}
  />
);

export default RadiologyOrderDeleteDialog;
