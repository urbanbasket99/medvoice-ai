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
  CERTIFICATE_TYPE_OPTIONS,
  certificateFormSchema,
  type CertificateFormValues,
} from "../schemas/certificateSchema";
import { CERTIFICATE_TYPE_LABELS } from "../utils/certificateUtils";

interface EntityOption {
  id: string;
  label: string;
}

interface CertificateFormProps {
  defaultValues: CertificateFormValues;
  onSubmit: (values: CertificateFormValues) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  serverError?: string | null;
  initialPatientLabel?: string;
  initialDoctorLabel?: string;
}

const CertificateForm = ({
  defaultValues,
  onSubmit,
  submitLabel = "Save Certificate",
  isSubmitting = false,
  serverError,
  initialPatientLabel,
  initialDoctorLabel,
}: CertificateFormProps) => {
  const [patientQuery, setPatientQuery] = useState("");
  const [doctorQuery, setDoctorQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<EntityOption | null>(
    defaultValues.patientId && initialPatientLabel
      ? { id: defaultValues.patientId, label: initialPatientLabel }
      : null
  );
  const [selectedDoctor, setSelectedDoctor] = useState<EntityOption | null>(
    defaultValues.doctorId && initialDoctorLabel
      ? { id: defaultValues.doctorId, label: initialDoctorLabel }
      : null
  );

  const {
    control,
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = useForm<CertificateFormValues>({
    defaultValues,
    resolver: zodResolver(certificateFormSchema),
  });

  const patientsQuery = useQuery({
    queryKey: ["certificates", "patient-search", patientQuery],
    queryFn: () => patientsApi.search({ query: patientQuery, page: 1, pageSize: 10 }),
    enabled: patientQuery.trim().length > 0,
  });

  const doctorsQuery = useQuery({
    queryKey: ["certificates", "doctor-search", doctorQuery],
    queryFn: () => doctorsApi.search({ query: doctorQuery, page: 1, pageSize: 10 }),
    enabled: doctorQuery.trim().length > 0,
  });

  useEffect(() => {
    setValue("patientId", selectedPatient?.id ?? "");
  }, [selectedPatient, setValue]);

  useEffect(() => {
    setValue("doctorId", selectedDoctor?.id ?? "");
  }, [selectedDoctor, setValue]);

  const patientOptions =
    patientsQuery.data?.items.map((patient) => ({
      id: patient.id,
      label: `${patient.fullName} (${patient.uhid})`,
    })) ?? [];

  const doctorOptions =
    doctorsQuery.data?.items.map((doctor) => ({
      id: doctor.id,
      label: `${doctor.fullName} (${doctor.doctorCode})`,
    })) ?? [];

  return (
    <Stack component="form" spacing={3} onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError && <Alert severity="error">{serverError}</Alert>}

      <Card variant="outlined">
        <CardHeader title="Certificate Details" />
        <Divider />
        <CardContent>
          <Stack spacing={2}>
            <Autocomplete
              options={patientOptions}
              value={selectedPatient}
              onChange={(_, option) => setSelectedPatient(option)}
              onInputChange={(_, value) => setPatientQuery(value)}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Patient"
                  size="small"
                  error={Boolean(errors.patientId)}
                  helperText={errors.patientId?.message}
                />
              )}
            />
            <Autocomplete
              options={doctorOptions}
              value={selectedDoctor}
              onChange={(_, option) => setSelectedDoctor(option)}
              onInputChange={(_, value) => setDoctorQuery(value)}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Doctor"
                  size="small"
                  error={Boolean(errors.doctorId)}
                  helperText={errors.doctorId?.message}
                />
              )}
            />
            <Controller
              name="certificateType"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Certificate type"
                  size="small"
                  fullWidth
                  error={Boolean(errors.certificateType)}
                  helperText={errors.certificateType?.message}
                >
                  {CERTIFICATE_TYPE_OPTIONS.map((type) => (
                    <MenuItem key={type} value={type}>
                      {CERTIFICATE_TYPE_LABELS[type]}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <TextField
                label="Issue date"
                type="date"
                size="small"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                {...register("issueDate")}
                error={Boolean(errors.issueDate)}
                helperText={errors.issueDate?.message}
              />
              <TextField
                label="Valid from"
                type="date"
                size="small"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                {...register("validFrom")}
              />
              <TextField
                label="Valid to"
                type="date"
                size="small"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                {...register("validTo")}
              />
            </Stack>
            <TextField label="Fitness status" size="small" fullWidth {...register("fitnessStatus")} />
            <TextField
              label="Rest days"
              size="small"
              type="number"
              fullWidth
              {...register("restDays")}
            />
            <TextField
              label="Diagnosis"
              size="small"
              fullWidth
              multiline
              minRows={2}
              {...register("diagnosis")}
            />
            <TextField
              label="Remarks"
              size="small"
              fullWidth
              multiline
              minRows={2}
              {...register("remarks")}
            />
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : undefined}
        >
          {submitLabel}
        </Button>
      </Box>
    </Stack>
  );
};

export default CertificateForm;
