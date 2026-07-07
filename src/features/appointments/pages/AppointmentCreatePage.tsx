import { useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";

import AppointmentForm from "../components/AppointmentForm";
import { useCreateAppointment } from "../hooks/useCreateAppointment";
import { appointmentFormDefaultValues } from "../schemas/appointmentSchema";
import type { AppointmentFormValues } from "../schemas/appointmentSchema";
import type { CreateAppointmentPayload } from "../types/appointment.types";
import { todayKey } from "../utils/dateUtils";

const toCreatePayload = (values: AppointmentFormValues): CreateAppointmentPayload => ({
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
});

const extractErrorMessage = (error: unknown): string => {
  const detail = (error as AxiosError<{ detail?: string }>)?.response?.data?.detail;
  return detail ?? "Could not create the appointment. Please check the form and try again.";
};

const AppointmentCreatePage = () => {
  const navigate = useNavigate();
  const createAppointment = useCreateAppointment();
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (values: AppointmentFormValues) => {
    setServerError(null);
    try {
      const appointment = await createAppointment.mutateAsync(toCreatePayload(values));
      navigate(`/appointments/${appointment.id}`, {
        replace: true,
        state: { flashMessage: `Appointment ${appointment.appointmentNumber} was created successfully.` },
      });
    } catch (error) {
      setServerError(extractErrorMessage(error));
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Create Appointment
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Appointment number and token are generated automatically on save.
        </Typography>
      </Box>

      <AppointmentForm
        defaultValues={{ ...appointmentFormDefaultValues, appointmentDate: todayKey() }}
        onSubmit={handleSubmit}
        submitLabel="Create Appointment"
        isSubmitting={createAppointment.isPending}
        serverError={serverError}
      />
    </Stack>
  );
};

export default AppointmentCreatePage;
