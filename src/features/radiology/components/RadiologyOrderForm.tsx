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

import { radiologyOrderFormSchema } from "../schemas/radiologySchema";

import type { RadiologyOrderFormValues } from "../schemas/radiologySchema";

import { defaultRadiologyOrderItem as createDefaultRadiologyOrderItem, inferContrastRequired } from "../utils/radiologyUtils";

import type { RadiologyTestMaster } from "../types/radiology.types";

import RadiologyTestSearch from "./RadiologyTestSearch";

import PrioritySelector from "./PrioritySelector";

import SelectedTestsGrid from "./SelectedTestsGrid";



export interface RadiologyOrderFormProps {

  defaultValues: RadiologyOrderFormValues;

  onSubmit: (values: RadiologyOrderFormValues) => Promise<void> | void;

  submitLabel?: string;

  isSubmitting?: boolean;

  serverError?: string | null;

  readOnly?: boolean;

  showConsultationField?: boolean;

  initialConsultation?: Consultation | null;

}



const RadiologyOrderForm = ({

  defaultValues,

  onSubmit,

  submitLabel = "Save Radiology Order",

  isSubmitting = false,

  serverError,

  readOnly = false,

  showConsultationField = true,

  initialConsultation = null,

}: RadiologyOrderFormProps) => {

  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(initialConsultation);

  const [pendingTest, setPendingTest] = useState<RadiologyTestMaster | string | null>(null);



  const methods = useForm<RadiologyOrderFormValues>({

    resolver: zodResolver(radiologyOrderFormSchema),

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

    () => (consultationsQuery.data?.items ?? []).filter((consultation) => consultation.status !== "cancelled"),

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

  };



  const handleAddTest = () => {

    if (!pendingTest) return;



    const name = typeof pendingTest === "string" ? pendingTest.trim() : pendingTest.testName.trim();

    if (!name) return;



    const existing = getValues("items");

    const duplicate = existing.some((item) => item.testName.toLowerCase() === name.toLowerCase());

    if (duplicate) {

      setPendingTest(null);

      return;

    }



    const contrastRequired =

      typeof pendingTest === "string" ? inferContrastRequired(name) : inferContrastRequired(pendingTest.testName);



    append({

      ...createDefaultRadiologyOrderItem(fields.length),

      radiologyTestMasterId: typeof pendingTest === "string" ? null : (pendingTest?.id ?? null),

      testName: name,

      category: typeof pendingTest === "string" ? "xray" : pendingTest.category,

      bodyPart: typeof pendingTest === "string" ? "" : pendingTest.bodyPart,

      contrastRequired,

    });

    setPendingTest(null);

  };



  return (

    <FormProvider {...methods}>

      <Box component="form" noValidate onSubmit={(event) => void handleSubmit(onSubmit)(event)}>

        <Stack spacing={3}>

          {serverError && <Alert severity="error">{serverError}</Alert>}



          <Card variant="outlined">

            <CardHeader title="Radiology Order Details" />

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



                <PrioritySelector disabled={readOnly} />



                <Controller

                  name="clinicalNotes"

                  control={control}

                  render={({ field }) => (

                    <TextField

                      {...field}

                      label="Clinical Notes"

                      fullWidth

                      multiline

                      minRows={2}

                      disabled={readOnly}

                      error={Boolean(errors.clinicalNotes)}

                      helperText={errors.clinicalNotes?.message}

                    />

                  )}

                />

              </Stack>

            </CardContent>

          </Card>



          <Card variant="outlined">

            <CardHeader title="Radiology Tests" />

            <Divider />

            <CardContent>

              <Stack spacing={2}>

                {!readOnly && (

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ alignItems: { sm: "flex-end" } }}>

                    <Box sx={{ flex: 1 }}>

                      <RadiologyTestSearch value={pendingTest} onChange={setPendingTest} label="Search Radiology Test" />

                    </Box>

                    <Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={handleAddTest}>

                      Add Test

                    </Button>

                  </Stack>

                )}



                {errors.items?.message && <Alert severity="error">{errors.items.message}</Alert>}



                <SelectedTestsGrid onRemove={remove} disabled={readOnly} />

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



export default RadiologyOrderForm;

