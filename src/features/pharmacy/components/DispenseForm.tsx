import { useEffect, useMemo, useState } from "react";
import { Controller, FormProvider, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
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
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

import { useConsultations } from "../../consultations/hooks/useConsultations";
import type { Consultation } from "../../consultations/types/consultation.types";
import { prescriptionsListQueryOptions } from "../../prescriptions/api/prescriptionsQueries";
import { dispenseFormSchema } from "../schemas/pharmacySchema";
import type { DispenseFormValues } from "../schemas/pharmacySchema";
import { defaultDispenseItem, toDispenseFormValuesFromPrescription } from "../utils/pharmacyUtils";
import type { PharmacyMedicine } from "../types/pharmacy.types";
import BatchSelector from "./BatchSelector";
import MedicineSearch from "./MedicineSearch";

export interface DispenseFormProps {
  defaultValues: DispenseFormValues;
  onSubmit: (values: DispenseFormValues) => Promise<void> | void;
  submitLabel?: string;
  isSubmitting?: boolean;
  serverError?: string | null;
  readOnly?: boolean;
  showConsultationField?: boolean;
  initialConsultation?: Consultation | null;
}

const DispenseForm = ({
  defaultValues,
  onSubmit,
  submitLabel = "Save Dispense",
  isSubmitting = false,
  serverError,
  readOnly = false,
  showConsultationField = true,
  initialConsultation = null,
}: DispenseFormProps) => {
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(initialConsultation);
  const [pendingMedicine, setPendingMedicine] = useState<PharmacyMedicine | string | null>(null);

  const methods = useForm<DispenseFormValues>({
    resolver: zodResolver(dispenseFormSchema),
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

  const prescriptionsQuery = useQuery({
    ...prescriptionsListQueryOptions({
      page: 1,
      pageSize: 1,
      sortBy: "created_at",
      sortDir: "desc",
      consultationId: selectedConsultation?.id,
    }),
    enabled: Boolean(showConsultationField && selectedConsultation?.id),
  });

  const linkedPrescription = prescriptionsQuery.data?.items[0] ?? null;

  const consultationOptions = useMemo(
    () => (consultationsQuery.data?.items ?? []).filter((c) => c.status !== "cancelled"),
    [consultationsQuery.data?.items]
  );

  useEffect(() => {
    if (initialConsultation) {
      setSelectedConsultation(initialConsultation);
      setValue("consultationId", initialConsultation.id);
    }
  }, [initialConsultation, setValue]);

  useEffect(() => {
    if (!showConsultationField || !selectedConsultation) {
      return;
    }

    if (prescriptionsQuery.isLoading) {
      return;
    }

    if (linkedPrescription) {
      setValue("prescriptionId", linkedPrescription.id, { shouldValidate: true });
      if (getValues("items").length === 0) {
        const fromPrescription = toDispenseFormValuesFromPrescription(linkedPrescription);
        setValue("items", fromPrescription.items, { shouldValidate: true });
      }
      return;
    }

    setValue("prescriptionId", "", { shouldValidate: true });
  }, [
    showConsultationField,
    selectedConsultation,
    linkedPrescription,
    prescriptionsQuery.isLoading,
    setValue,
    getValues,
  ]);

  const handleConsultationChange = (consultation: Consultation | null) => {
    setSelectedConsultation(consultation);
    setValue("consultationId", consultation?.id ?? "", { shouldValidate: true });
    setValue("prescriptionId", "", { shouldValidate: true });
    setValue("items", [], { shouldValidate: true });
  };

  const handleAddMedicine = () => {
    if (!pendingMedicine) return;
    const name =
      typeof pendingMedicine === "string" ? pendingMedicine.trim() : pendingMedicine.brandName.trim();
    if (!name) return;

    append({
      ...defaultDispenseItem(fields.length),
      medicineId: typeof pendingMedicine === "string" ? null : pendingMedicine.id,
      medicineName: name,
      unitPrice: typeof pendingMedicine === "string" ? "" : (pendingMedicine.sellingPrice ?? ""),
    });
    setPendingMedicine(null);
  };

  return (
    <FormProvider {...methods}>
      <Box component="form" noValidate onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
        <Stack spacing={3}>
          {serverError && <Alert severity="error">{serverError}</Alert>}

          <Card variant="outlined">
            <CardHeader title="Dispense Details" />
            <Divider />
            <CardContent>
              <Stack spacing={2.5}>
                {showConsultationField ? (
                  <>
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
                    {selectedConsultation && prescriptionsQuery.isFetching && (
                      <Typography variant="body2" color="text.secondary">
                        Looking up prescription for this consultation…
                      </Typography>
                    )}
                    {selectedConsultation &&
                      !prescriptionsQuery.isFetching &&
                      !linkedPrescription && (
                        <Alert severity="warning">
                          No prescription found for this consultation. Create a prescription before dispensing
                          medicines.
                        </Alert>
                      )}
                    {linkedPrescription && (
                      <Alert severity="info">
                        Linked prescription loaded. Medicines from the prescription have been pre-filled when available.
                      </Alert>
                    )}
                    {errors.prescriptionId?.message && (
                      <Alert severity="error">{errors.prescriptionId.message}</Alert>
                    )}
                  </>
                ) : selectedConsultation ? (
                  <TextField
                    label="Consultation"
                    value={`${selectedConsultation.visitNumber} • ${selectedConsultation.patientName ?? "Patient"}`}
                    fullWidth
                    disabled
                  />
                ) : null}

                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Notes"
                      fullWidth
                      multiline
                      minRows={2}
                      disabled={readOnly}
                      error={Boolean(errors.notes)}
                      helperText={errors.notes?.message}
                    />
                  )}
                />
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader title="Medicines to Dispense" />
            <Divider />
            <CardContent>
              <Stack spacing={2}>
                {!readOnly && (
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ alignItems: { sm: "flex-end" } }}>
                    <Box sx={{ flex: 1 }}>
                      <MedicineSearch value={pendingMedicine} onChange={setPendingMedicine} label="Search Medicine" />
                    </Box>
                    <Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={handleAddMedicine}>
                      Add Medicine
                    </Button>
                  </Stack>
                )}

                {errors.items?.message && <Alert severity="error">{errors.items.message}</Alert>}

                {fields.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No medicines added yet.
                  </Typography>
                ) : (
                  fields.map((field, index) => (
                    <Stack
                      key={field.id}
                      spacing={1.5}
                      sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 1 }}
                    >
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <Typography variant="subtitle2" sx={{ flex: 1, fontWeight: 600 }}>
                          {index + 1}. {getValues(`items.${index}.medicineName`) || "Medicine"}
                        </Typography>
                        {!readOnly && (
                          <IconButton size="small" color="error" onClick={() => remove(index)}>
                            <DeleteOutlineRoundedIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Stack>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                        <Controller
                          name={`items.${index}.quantity`}
                          control={control}
                          render={({ field: qtyField }) => (
                            <TextField
                              {...qtyField}
                              label="Quantity"
                              type="number"
                              size="small"
                              disabled={readOnly}
                              sx={{ width: { sm: 120 } }}
                              error={Boolean(errors.items?.[index]?.quantity)}
                            />
                          )}
                        />
                        <Controller
                          name={`items.${index}.unitPrice`}
                          control={control}
                          render={({ field: priceField }) => (
                            <TextField
                              {...priceField}
                              label="Unit Price"
                              size="small"
                              disabled={readOnly}
                              sx={{ width: { sm: 140 } }}
                            />
                          )}
                        />
                        <Controller
                          name={`items.${index}.batchId`}
                          control={control}
                          render={({ field: batchField }) => (
                            <Box sx={{ flex: 1 }}>
                              <BatchSelector
                                medicineId={getValues(`items.${index}.medicineId`) ?? null}
                                value={batchField.value ?? null}
                                onChange={batchField.onChange}
                                disabled={readOnly}
                              />
                            </Box>
                          )}
                        />
                      </Stack>
                      <Controller
                        name={`items.${index}.instructions`}
                        control={control}
                        render={({ field: instrField }) => (
                          <TextField
                            {...instrField}
                            label="Instructions"
                            size="small"
                            fullWidth
                            disabled={readOnly}
                          />
                        )}
                      />
                    </Stack>
                  ))
                )}
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

export default DispenseForm;
