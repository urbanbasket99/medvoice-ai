import { useMemo, useState } from "react";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import type { AxiosError } from "axios";

import AppointmentForm from "../components/AppointmentForm";
import { useAppointment } from "../hooks/useAppointment";
import { useUpdateAppointment } from "../hooks/useUpdateAppointment";
import { appointmentFormDefaultValues } from "../schemas/appointmentSchema";
import type { AppointmentFormValues } from "../schemas/appointmentSchema";
import type { UpdateAppointmentPayload } from "../types/appointment.types";

const toUpdatePayload = (values: AppointmentFormValues): UpdateAppointmentPayload => ({
  patientId: values.patientId,
  doctorId: values.doctorId,
  department: values.department,
  appointmentDate: values.appointmentDate,
  appointmentTime: values.appointmentTime,
  durationMinutes: values.durationMinutes,
  appointmentType: values.appointmentType,
  priority: values.priority,
  chiefComplaint: values.chiefComplaint || null,
  notes: values.notes || null,
  room: values.room || null,
  status: values.status ?? "scheduled",
});

const extractErrorMessage = (error: unknown): string => {
  const detail = (error as AxiosError<{ detail?: string }>)?.response?.data?.detail;
  return detail ?? "Could not update the appointment. Please check the form and try again.";
};

const AppointmentEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: appointment, isLoading, isError } = useAppointment(id);
  const updateAppointment = useUpdateAppointment();
  const [serverError, setServerError] = useState<string | null>(null);

  const defaultValues = useMemo<AppointmentFormValues | null>(() => {
    if (!appointment) return null;
    return {
      ...appointmentFormDefaultValues,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      department: appointment.department,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      durationMinutes: appointment.durationMinutes,
      appointmentType: appointment.appointmentType,
      priority: appointment.priority,
      chiefComplaint: appointment.chiefComplaint ?? "",
      notes: appointment.notes ?? "",
      room: appointment.room ?? "",
      status: appointment.status,
    };
  }, [appointment]);

  const handleSubmit = async (values: AppointmentFormValues) => {
    if (!id) return;
    setServerError(null);
    try {
      const updated = await updateAppointment.mutateAsync({ id, payload: toUpdatePayload(values) });
      navigate(`/appointments/${updated.id}`, {
        replace: true,
        state: { flashMessage: `Appointment ${updated.appointmentNumber} was updated successfully.` },
      });
    } catch (error) {
      setServerError(extractErrorMessage(error));
    }
  };

  if (isLoading) {
    return <Alert severity="info">Loading appointment…</Alert>;
  }

  if (isError || !appointment || !defaultValues) {
    return <Alert severity="error">Appointment not found or the request failed.</Alert>;
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Edit Appointment
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Update schedule details and status for {appointment.appointmentNumber}.
        </Typography>
      </Box>

      <AppointmentForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
        isSubmitting={updateAppointment.isPending}
        serverError={serverError}
        showStatusField
        initialPatientLabel={appointment.patientName ?? undefined}
        initialDoctorLabel={appointment.doctorName ?? undefined}
      />
    </Stack>
  );
};

export default AppointmentEditPage;
