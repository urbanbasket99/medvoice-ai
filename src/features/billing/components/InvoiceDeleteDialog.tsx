import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import type { Invoice } from "../types/billing.types";

const InvoiceDeleteDialog = ({
  invoice,
  isDeleting,
  onConfirm,
  onClose,
}: {
  invoice: Invoice | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) => (
  <ConfirmDialog
    open={Boolean(invoice)}
    title="Delete Invoice?"
    message={
      <>
        Delete invoice <strong>{invoice?.invoiceNumber}</strong> for{" "}
        <strong>{invoice?.patientName ?? "this patient"}</strong>? This action cannot be undone.
      </>
    }
    confirmLabel="Delete"
    confirmingLabel="Deleting…"
    isPending={isDeleting}
    onConfirm={onConfirm}
    onClose={onClose}
  />
);

export default InvoiceDeleteDialog;
