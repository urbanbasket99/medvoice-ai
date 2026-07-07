import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

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
  <Dialog open={Boolean(appointment)} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>Cancel Appointment</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Cancel appointment <strong>{appointment?.appointmentNumber}</strong> for{" "}
        <strong>{appointment?.patientName}</strong>?
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} disabled={isDeleting}>Keep</Button>
      <Button color="error" variant="contained" onClick={onConfirm} disabled={isDeleting}>
        {isDeleting ? "Cancelling…" : "Cancel Appointment"}
      </Button>
    </DialogActions>
  </Dialog>
);

export default AppointmentDeleteDialog;
