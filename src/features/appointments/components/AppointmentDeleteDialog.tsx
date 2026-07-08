import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import type { Appointment } from "../types/appointment.types";

const AppointmentDeleteDialog = ({
  appointment,
  isDeleting,
  onConfirm,
  onClose,
}: {
  appointment: Appointment | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) => (
  <ConfirmDialog
    open={Boolean(appointment)}
    title="Cancel Appointment?"
    message={
      <>
        Cancel appointment <strong>{appointment?.appointmentNumber}</strong> for{" "}
        <strong>{appointment?.patientName}</strong>?
      </>
    }
    confirmLabel="Cancel Appointment"
    confirmingLabel="Cancelling…"
    isPending={isDeleting}
    onConfirm={onConfirm}
    onClose={onClose}
  />
);

export default AppointmentDeleteDialog;
