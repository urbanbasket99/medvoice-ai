import { useEffect, useMemo, useState } from "react";
import { Controller, FormProvider, useFieldArray, useForm } from "react-hook-form";
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
  Stack,
  TextField,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import { useConsultations } from "../../consultations/hooks/useConsultations";
import type { Consultation } from "../../consultations/types/consultation.types";
import { prescriptionFormSchema } from "../schemas/prescriptionSchema";
import type { PrescriptionFormValues } from "../schemas/prescriptionSchema";
import { defaultPrescriptionItem } from "../utils/prescriptionUtils";
import MedicineSelector from "./MedicineSelector";

export interface PrescriptionFormProps {
  defaultValues: PrescriptionFormValues;
  onSubmit: (values: PrescriptionFormValues) => Promise<void> | void;
  submitLabel?: string;
  isSubmitting?: boolean;
  serverError?: string | null;
  readOnly?: boolean;
  showConsultationField?: boolean;
  initialConsultation?: Consultation | null;
}

const PrescriptionForm = ({
  defaultValues,
  onSubmit,
  submitLabel = "Save Prescription",
  isSubmitting = false,
  serverError,
  readOnly = false,
  showConsultationField = true,
  initialConsultation = null,
}: PrescriptionFormProps) => {
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(initialConsultation);

  const methods = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionFormSchema),
    defaultValues,
  });

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = methods;

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const consultationsQuery = useConsultations({
    page: 1,
    pageSize: 100,
    sortBy: "created_at",
    sortDir: "desc",
  });

  const consultationOptions = useMemo(
    () =>
      (consultationsQuery.data?.items ?? []).filter(
        (consultation) => consultation.status !== "cancelled"
      ),
    [consultationsQuery.data?.items]
  );

  useEffect(() => {
    if (initialConsultation) {
      setSelectedConsultation(initialConsultation);
      setValue("consultationId", initialConsultation.id);
    }
  }, [initialConsultation, setValue]);

  const handleConsultationChange = (consultation: Consultation | null) => {
    setSelectedConsultation(consultation);
    setValue("consultationId", consultation?.id ?? "", { shouldValidate: true });
    if (consultation?.diagnosis && !getValues("diagnosis")) {
      setValue("diagnosis", consultation.diagnosis);
    }
  };

  return (
    <FormProvider {...methods}>
      <Box component="form" noValidate onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
        <Stack spacing={3}>
          {serverError && <Alert severity="error">{serverError}</Alert>}

          <Card variant="outlined">
            <CardHeader title="Prescription Details" />
            <Divider />
            <CardContent>
              <Stack spacing={2.5}>
                {showConsultationField ? (
                  <Autocomplete
                    options={consultationOptions}
                    loading={consultationsQuery.isLoading}
                    disabled={readOnly}
                    value={selectedConsultation}
                    onChange={(_, option) => handleConsultationChange(option)}
                    getOptionLabel={(option) =>
                      `${option.visitNumber} • ${option.patientName ?? "Patient"} • ${option.doctorName ?? "Doctor"}`
                    }
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Consultation"
                        required
                        error={Boolean(errors.consultationId)}
                        helperText={errors.consultationId?.message}
                      />
                    )}
                  />
                ) : selectedConsultation ? (
                  <TextField
                    label="Consultation"
                    value={`${selectedConsultation.visitNumber} • ${selectedConsultation.patientName ?? "Patient"}`}
                    fullWidth
                    disabled
                  />
                ) : null}

                <Controller
                  name="diagnosis"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Diagnosis"
                      fullWidth
                      multiline
                      minRows={2}
                      disabled={readOnly}
                      error={Boolean(errors.diagnosis)}
                      helperText={errors.diagnosis?.message}
                    />
                  )}
                />

                <Controller
                  name="advice"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Advice"
                      fullWidth
                      multiline
                      minRows={2}
                      disabled={readOnly}
                      error={Boolean(errors.advice)}
                      helperText={errors.advice?.message}
                    />
                  )}
                />
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader
              title="Medicines"
              action={
                !readOnly && (
                  <Button
                    size="small"
                    startIcon={<AddRoundedIcon />}
                    onClick={() => append(defaultPrescriptionItem(fields.length))}
                  >
                    Add Medicine
                  </Button>
                )
              }
            />
            <Divider />
            <CardContent>
              <Stack spacing={2}>
                {errors.items?.message && (
                  <Alert severity="error">{errors.items.message}</Alert>
                )}
                {fields.map((field, index) => (
                  <MedicineSelector
                    key={field.id}
                    index={index}
                    onRemove={() => remove(index)}
                    canRemove={!readOnly && fields.length > 1}
                    disabled={readOnly}
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>

          {!readOnly && (
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
          )}
        </Stack>
      </Box>
    </FormProvider>
  );
};

export default PrescriptionForm;
