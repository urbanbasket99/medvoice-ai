import ConfirmDialog from "../../../components/ui/ConfirmDialog";
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
  <ConfirmDialog
    open={Boolean(labOrder)}
    title="Delete Lab Order?"
    message={
      <>
        Delete lab order <strong>{labOrder?.orderNumber}</strong> for <strong>{labOrder?.patientName}</strong>
        {labOrder?.consultationVisitNumber ? ` (Visit ${labOrder.consultationVisitNumber})` : ""}? This action cannot
        be undone.
      </>
    }
    confirmLabel="Delete"
    confirmingLabel="Deleting…"
    isPending={isDeleting}
    onConfirm={onConfirm}
    onClose={onClose}
  />
);

export default LabOrderDeleteDialog;
