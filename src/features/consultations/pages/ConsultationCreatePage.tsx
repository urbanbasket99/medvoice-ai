import { useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";

import { appointmentsApi } from "../../appointments/api/appointmentsApi";
import type { Appointment } from "../../appointments/types/appointment.types";
import { useCreateConsultation } from "../hooks/useCreateConsultation";

const extractErrorMessage = (error: unknown): string => {
  const detail = (error as AxiosError<{ detail?: string }>)?.response?.data?.detail;
  return detail ?? "Could not start the consultation. Please try again.";
};

const ConsultationCreatePage = () => {
  const navigate = useNavigate();
  const createConsultation = useCreateConsultation();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const appointmentsQuery = useQuery({
    queryKey: ["appointments", "consultation-start"],
    queryFn: () =>
      appointmentsApi.list({
        page: 1,
        pageSize: 100,
        sortBy: "appointment_date",
        sortDir: "desc",
      }),
  });

  const eligibleAppointments = useMemo(
    () =>
      (appointmentsQuery.data?.items ?? []).filter((appointment) =>
        ["scheduled", "confirmed", "checked_in", "in_consultation"].includes(appointment.status)
      ),
    [appointmentsQuery.data?.items]
  );

  const handleStart = async () => {
    if (!selectedAppointment) return;
    setServerError(null);
    try {
      const consultation = await createConsultation.mutateAsync({ appointmentId: selectedAppointment.id });
      navigate(`/consultations/${consultation.id}/edit`, {
        replace: true,
        state: { flashMessage: `Consultation ${consultation.visitNumber} started.` },
      });
    } catch (error) {
      setServerError(extractErrorMessage(error));
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Start Consultation
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select an appointment to open the consultation workspace.
        </Typography>
      </Box>

      {serverError && <Alert severity="error">{serverError}</Alert>}

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2.5}>
            <Autocomplete
              options={eligibleAppointments}
              loading={appointmentsQuery.isLoading}
              getOptionLabel={(option) =>
                `${option.appointmentNumber} • ${option.patientName ?? "Patient"} • ${option.doctorName ?? "Doctor"}`
              }
              value={selectedAppointment}
              onChange={(_, option) => setSelectedAppointment(option)}
              renderInput={(params) => (
                <TextField {...params} label="Appointment" placeholder="Search eligible appointments" />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />

            <Stack direction="row" spacing={1.5} sx={{ justifyContent: "flex-end" }}>
              <Button onClick={() => navigate("/consultations")}>Cancel</Button>
              <Button
                variant="contained"
                disabled={!selectedAppointment || createConsultation.isPending}
                onClick={() => void handleStart()}
              >
                {createConsultation.isPending ? "Starting…" : "Open Workspace"}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default ConsultationCreatePage;
