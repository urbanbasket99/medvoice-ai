import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import type { DispenseRecord, PharmacyMedicine } from "../types/pharmacy.types";

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
  <ConfirmDialog
    open={Boolean(dispense)}
    title="Delete Dispense Record?"
    message={
      <>
        Delete dispense <strong>{dispense?.orderNumber}</strong> for <strong>{dispense?.patientName}</strong>
        {dispense?.consultationVisitNumber ? ` (Visit ${dispense.consultationVisitNumber})` : ""}? This action cannot
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
  <ConfirmDialog
    open={Boolean(medicine)}
    title="Delete Medicine?"
    message={
      <>
        Delete medicine <strong>{medicine?.brandName}</strong> ({medicine?.medicineCode})? This action cannot be undone.
      </>
    }
    confirmLabel="Delete"
    confirmingLabel="Deleting…"
    isPending={isDeleting}
    onConfirm={onConfirm}
    onClose={onClose}
  />
);

export default DispenseDeleteDialog;
