import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";

import { doctorsApi } from "../../doctors/api/doctorsApi";
import { patientsApi } from "../../patients/api/patientsApi";
import {
  APPOINTMENT_PRIORITY_LABELS,
  APPOINTMENT_PRIORITY_OPTIONS,
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_OPTIONS,
  APPOINTMENT_TYPE_LABELS,
  APPOINTMENT_TYPE_OPTIONS,
  DEPARTMENT_LABELS,
  DEPARTMENT_OPTIONS,
  appointmentFormSchema,
} from "../schemas/appointmentSchema";
import type { AppointmentFormValues } from "../schemas/appointmentSchema";

interface EntityOption {
  id: string;
  label: string;
  department?: AppointmentFormValues["department"];
}

export interface AppointmentFormProps {
  defaultValues: AppointmentFormValues;
  onSubmit: (values: AppointmentFormValues) => Promise<void> | void;
  submitLabel?: string;
  isSubmitting?: boolean;
  serverError?: string | null;
  showStatusField?: boolean;
  initialPatientLabel?: string;
  initialDoctorLabel?: string;
}

const sectionGridSx = {
  display: "grid",
  gap: 2,
  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
} as const;

const AppointmentForm = ({
  defaultValues,
  onSubmit,
  submitLabel = "Save Appointment",
  isSubmitting = false,
  serverError,
  showStatusField = false,
  initialPatientLabel,
  initialDoctorLabel,
}: AppointmentFormProps) => {
  const [patientQuery, setPatientQuery] = useState("");
  const [doctorQuery, setDoctorQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<EntityOption | null>(
    defaultValues.patientId && initialPatientLabel
      ? { id: defaultValues.patientId, label: initialPatientLabel }
      : null
  );
  const [selectedDoctor, setSelectedDoctor] = useState<EntityOption | null>(
    defaultValues.doctorId && initialDoctorLabel
      ? { id: defaultValues.doctorId, label: initialDoctorLabel, department: defaultValues.department }
      : null
  );

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues,
  });

  const patientsQuery = useQuery({
    queryKey: ["patients", "form-search", patientQuery],
    queryFn: () => patientsApi.search({ query: patientQuery, page: 1, pageSize: 10 }),
    enabled: patientQuery.trim().length > 1,
  });

  const doctorsQuery = useQuery({
    queryKey: ["doctors", "form-search", doctorQuery],
    queryFn: () => doctorsApi.search({ query: doctorQuery, page: 1, pageSize: 10 }),
    enabled: doctorQuery.trim().length > 1,
  });

  const patientOptions: EntityOption[] =
    patientsQuery.data?.items.map((patient) => ({
      id: patient.id,
      label: `${patient.fullName} (${patient.uhid ?? patient.mrn ?? "—"})`,
    })) ?? (selectedPatient ? [selectedPatient] : []);

  const doctorOptions: EntityOption[] =
    doctorsQuery.data?.items.map((doctor) => ({
      id: doctor.id,
      label: `${doctor.fullName} (${doctor.doctorCode})`,
      department: doctor.department,
    })) ?? (selectedDoctor ? [selectedDoctor] : []);

  useEffect(() => {
    if (selectedDoctor?.department) {
      setValue("department", selectedDoctor.department);
    }
  }, [selectedDoctor, setValue]);

  return (
    <Box component="form" noValidate onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
      <Stack spacing={3}>
        {serverError && <Alert severity="error">{serverError}</Alert>}

        <Card variant="outlined">
          <CardHeader title="Participants" />
          <Divider />
          <CardContent>
            <Box sx={sectionGridSx}>
              <Controller
                name="patientId"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    options={patientOptions}
                    getOptionLabel={(option) => option.label}
                    value={selectedPatient}
                    onInputChange={(_, inputValue) => setPatientQuery(inputValue)}
                    onChange={(_, option) => {
                      setSelectedPatient(option);
                      field.onChange(option?.id ?? "");
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Patient"
                        required
                        error={Boolean(errors.patientId)}
                        helperText={errors.patientId?.message}
                      />
                    )}
                    isOptionEqualToValue={(option, selected) => option.id === selected.id}
                  />
                )}
              />

              <Controller
                name="doctorId"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    options={doctorOptions}
                    getOptionLabel={(option) => option.label}
                    value={selectedDoctor}
                    onInputChange={(_, inputValue) => setDoctorQuery(inputValue)}
                    onChange={(_, option) => {
                      setSelectedDoctor(option);
                      field.onChange(option?.id ?? "");
                      if (option?.department) {
                        setValue("department", option.department);
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Doctor"
                        required
                        error={Boolean(errors.doctorId)}
                        helperText={errors.doctorId?.message}
                      />
                    )}
                    isOptionEqualToValue={(option, selected) => option.id === selected.id}
                  />
                )}
              />

              <Controller
                name="department"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Department"
                    required
                    error={Boolean(errors.department)}
                    helperText={errors.department?.message}
                  >
                    {DEPARTMENT_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {DEPARTMENT_LABELS[option]}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Box>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardHeader title="Schedule" />
          <Divider />
          <CardContent>
            <Box sx={sectionGridSx}>
              <Controller
                name="appointmentDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Appointment Date"
                    type="date"
                    required
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={Boolean(errors.appointmentDate)}
                    helperText={errors.appointmentDate?.message}
                  />
                )}
              />

              <Controller
                name="appointmentTime"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Appointment Time"
                    type="time"
                    required
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={Boolean(errors.appointmentTime)}
                    helperText={errors.appointmentTime?.message}
                  />
                )}
              />

              <Controller
                name="durationMinutes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Duration (minutes)"
                    type="number"
                    required
                    error={Boolean(errors.durationMinutes)}
                    helperText={errors.durationMinutes?.message}
                  />
                )}
              />

              <Controller
                name="room"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Room"
                    error={Boolean(errors.room)}
                    helperText={errors.room?.message}
                  />
                )}
              />

              <Controller
                name="appointmentType"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Appointment Type" required>
                    {APPOINTMENT_TYPE_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {APPOINTMENT_TYPE_LABELS[option]}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />

              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Priority" required>
                    {APPOINTMENT_PRIORITY_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {APPOINTMENT_PRIORITY_LABELS[option]}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />

              {showStatusField && (
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Status" required>
                      {APPOINTMENT_STATUS_OPTIONS.map((option) => (
                        <MenuItem key={option} value={option}>
                          {APPOINTMENT_STATUS_LABELS[option]}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              )}
            </Box>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardHeader title="Clinical Notes" />
          <Divider />
          <CardContent>
            <Stack spacing={2}>
              <Controller
                name="chiefComplaint"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Chief Complaint"
                    multiline
                    minRows={2}
                    error={Boolean(errors.chiefComplaint)}
                    helperText={errors.chiefComplaint?.message}
                  />
                )}
              />
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Notes"
                    multiline
                    minRows={2}
                    error={Boolean(errors.notes)}
                    helperText={errors.notes?.message}
                  />
                )}
              />
            </Stack>
          </CardContent>
        </Card>

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button type="submit" variant="contained" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : undefined}>
            {submitLabel}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default AppointmentForm;
