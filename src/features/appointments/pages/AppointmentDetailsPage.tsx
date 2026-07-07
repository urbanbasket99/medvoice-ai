import type { ReactNode } from "react";
import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../auth";
import AppointmentCard from "../components/AppointmentCard";
import AppointmentDeleteDialog from "../components/AppointmentDeleteDialog";
import AppointmentDetailsSkeleton from "../components/AppointmentDetailsSkeleton";
import AppointmentSnackbar from "../components/AppointmentSnackbar";
import {
  APPOINTMENT_PRIORITY_LABELS,
  APPOINTMENT_TYPE_LABELS,
  DEPARTMENT_LABELS,
} from "../schemas/appointmentSchema";
import { useConsumeFlashMessage } from "../hooks/useConsumeFlashMessage";
import { useDeleteAppointment } from "../hooks/useDeleteAppointment";
import { useAppointment } from "../hooks/useAppointment";
import { useAppointmentSnackbar } from "../hooks/useAppointmentSnackbar";
import { formatDisplayDate, formatDisplayTime } from "../utils/dateUtils";

interface DetailRowProps {
  label: string;
  value: ReactNode;
}

const DetailRow = ({ label, value }: DetailRowProps) => (
  <Box>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2">{value ?? "\u2014"}</Typography>
  </Box>
);

const detailGridSx = {
  display: "grid",
  gap: 2,
  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" },
} as const;

const AppointmentDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canUpdate = Boolean(user?.isSuperuser || user?.permissions.includes("appointments:update"));
  const canDelete = Boolean(user?.isSuperuser || user?.permissions.includes("appointments:delete"));
  const { data: appointment, isLoading, isError, refetch } = useAppointment(id);
  const deleteAppointment = useDeleteAppointment();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const { snackbar, showSuccess, showError, closeSnackbar } = useAppointmentSnackbar();

  useConsumeFlashMessage(showSuccess);

  const handleConfirmCancel = async () => {
    if (!appointment) return;
    try {
      await deleteAppointment.mutateAsync(appointment.id);
      showSuccess(`Appointment ${appointment.appointmentNumber} was cancelled.`);
      setConfirmingDelete(false);
    } catch {
      showError(`Could not cancel appointment ${appointment.appointmentNumber}. Please try again.`);
    }
  };

  if (isLoading) {
    return <AppointmentDetailsSkeleton />;
  }

  if (isError || !appointment) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => void refetch()}>
            Retry
          </Button>
        }
      >
        Appointment not found, or the request failed. Please try again.
      </Alert>
    );
  }

  const canModify = appointment.status !== "cancelled" && appointment.status !== "completed";

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate("/appointments")}>
          Back to Appointments
        </Button>
        <Box sx={{ flex: 1 }} />
        {canUpdate && canModify && (
          <Button variant="outlined" startIcon={<EditRoundedIcon />} onClick={() => navigate(`/appointments/${appointment.id}/edit`)}>
            Edit
          </Button>
        )}
        {canDelete && canModify && (
          <Button color="error" variant="outlined" startIcon={<DeleteOutlineRoundedIcon />} onClick={() => setConfirmingDelete(true)}>
            Cancel Appointment
          </Button>
        )}
      </Stack>

      <AppointmentCard appointment={appointment} />

      <Card variant="outlined">
        <CardHeader title="Appointment Details" />
        <Divider />
        <CardContent>
          <Box sx={detailGridSx}>
            <DetailRow label="Patient" value={appointment.patientName} />
            <DetailRow label="UHID / MRN" value={appointment.patientUhid} />
            <DetailRow label="Doctor" value={appointment.doctorName} />
            <DetailRow label="Doctor Code" value={appointment.doctorCode} />
            <DetailRow label="Department" value={DEPARTMENT_LABELS[appointment.department]} />
            <DetailRow label="Date" value={formatDisplayDate(appointment.appointmentDate)} />
            <DetailRow label="Time" value={formatDisplayTime(appointment.appointmentTime)} />
            <DetailRow label="Duration" value={`${appointment.durationMinutes} minutes`} />
            <DetailRow label="Type" value={APPOINTMENT_TYPE_LABELS[appointment.appointmentType]} />
            <DetailRow label="Priority" value={APPOINTMENT_PRIORITY_LABELS[appointment.priority]} />
            <DetailRow label="Room" value={appointment.room} />
            <DetailRow label="Token Number" value={appointment.tokenNumber} />
          </Box>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardHeader title="Clinical Information" />
        <Divider />
        <CardContent>
          <Stack spacing={2}>
            <DetailRow label="Chief Complaint" value={appointment.chiefComplaint} />
            <DetailRow label="Notes" value={appointment.notes} />
          </Stack>
        </CardContent>
      </Card>

      <AppointmentDeleteDialog
        appointment={confirmingDelete ? appointment : null}
        isDeleting={deleteAppointment.isPending}
        onConfirm={() => void handleConfirmCancel()}
        onClose={() => setConfirmingDelete(false)}
      />
      <AppointmentSnackbar state={snackbar} onClose={closeSnackbar} />
    </Stack>
  );
};

export default AppointmentDetailsPage;
