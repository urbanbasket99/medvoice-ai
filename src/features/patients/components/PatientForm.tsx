import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
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

import {
  BLOOD_GROUP_OPTIONS,
  GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  PATIENT_STATUS_OPTIONS,
  patientFormSchema,
} from "../schemas/patientSchema";
import type { PatientFormValues } from "../schemas/patientSchema";

export interface PatientFormProps {
  defaultValues: PatientFormValues;
  onSubmit: (values: PatientFormValues) => Promise<void> | void;
  submitLabel?: string;
  isSubmitting?: boolean;
  serverError?: string | null;
  showStatusField?: boolean;
}

const sectionGridSx = {
  display: "grid",
  gap: 2,
  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
} as const;

const GENDER_LABEL: Record<(typeof GENDER_OPTIONS)[number], string> = {
  male: "Male",
  female: "Female",
  other: "Other",
};

const MARITAL_STATUS_LABEL: Record<(typeof MARITAL_STATUS_OPTIONS)[number], string> = {
  single: "Single",
  married: "Married",
  divorced: "Divorced",
  widowed: "Widowed",
  other: "Other",
};

const STATUS_LABEL: Record<(typeof PATIENT_STATUS_OPTIONS)[number], string> = {
  active: "Active",
  inactive: "Inactive",
  deceased: "Deceased",
};

/**
 * Enterprise patient registration/edit form: Personal, Contact, Address,
 * Medical, Emergency Contact, Insurance, and Administrative sections, each
 * its own `Card` for visual grouping. Validation is entirely delegated to
 * `patientFormSchema` (Zod) via `zodResolver` — this component only wires
 * fields to it.
 */
const PatientForm = ({
  defaultValues,
  onSubmit,
  submitLabel = "Save Patient",
  isSubmitting = false,
  serverError,
  showStatusField = false,
}: PatientFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues,
  });

  return (
    <Box component="form" noValidate onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
      <Stack spacing={3}>
        {serverError && <Alert severity="error">{serverError}</Alert>}

        <Card variant="outlined">
          <CardHeader title="Personal Information" />
          <Divider />
          <CardContent>
            <Box sx={sectionGridSx}>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="First Name"
                    required
                    fullWidth
                    error={Boolean(errors.firstName)}
                    helperText={errors.firstName?.message}
                  />
                )}
              />
              <Controller
                name="middleName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Middle Name"
                    fullWidth
                    error={Boolean(errors.middleName)}
                    helperText={errors.middleName?.message}
                  />
                )}
              />
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Last Name"
                    required
                    fullWidth
                    error={Boolean(errors.lastName)}
                    helperText={errors.lastName?.message}
                  />
                )}
              />
              <Controller
                name="dateOfBirth"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="date"
                    label="Date of Birth"
                    required
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={Boolean(errors.dateOfBirth)}
                    helperText={errors.dateOfBirth?.message}
                  />
                )}
              />
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Gender"
                    required
                    fullWidth
                    error={Boolean(errors.gender)}
                    helperText={errors.gender?.message}
                  >
                    {GENDER_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {GENDER_LABEL[option]}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <Controller
                name="bloodGroup"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Blood Group"
                    fullWidth
                    error={Boolean(errors.bloodGroup)}
                    helperText={errors.bloodGroup?.message}
                  >
                    <MenuItem value="">Unknown</MenuItem>
                    {BLOOD_GROUP_OPTIONS.filter((option) => option !== "unknown").map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <Controller
                name="maritalStatus"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Marital Status"
                    fullWidth
                    error={Boolean(errors.maritalStatus)}
                    helperText={errors.maritalStatus?.message}
                  >
                    <MenuItem value="">Not specified</MenuItem>
                    {MARITAL_STATUS_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {MARITAL_STATUS_LABEL[option]}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <Controller
                name="occupation"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Occupation"
                    fullWidth
                    error={Boolean(errors.occupation)}
                    helperText={errors.occupation?.message}
                  />
                )}
              />
              {showStatusField && (
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      value={field.value ?? "active"}
                      select
                      label="Status"
                      fullWidth
                      error={Boolean(errors.status)}
                      helperText={errors.status?.message}
                    >
                      {PATIENT_STATUS_OPTIONS.map((option) => (
                        <MenuItem key={option} value={option}>
                          {STATUS_LABEL[option]}
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
          <CardHeader title="Contact Information" />
          <Divider />
          <CardContent>
            <Box sx={sectionGridSx}>
              <Controller
                name="mobile"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Mobile Number"
                    required
                    fullWidth
                    error={Boolean(errors.mobile)}
                    helperText={errors.mobile?.message}
                  />
                )}
              />
              <Controller
                name="alternateMobile"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Alternate Mobile"
                    fullWidth
                    error={Boolean(errors.alternateMobile)}
                    helperText={errors.alternateMobile?.message}
                  />
                )}
              />
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="email"
                    label="Email"
                    fullWidth
                    error={Boolean(errors.email)}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Box>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardHeader title="Address" />
          <Divider />
          <CardContent>
            <Box sx={sectionGridSx}>
              <Controller
                name="addressLine1"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Address Line 1"
                    fullWidth
                    sx={{ gridColumn: { sm: "1 / -1" } }}
                    error={Boolean(errors.addressLine1)}
                    helperText={errors.addressLine1?.message}
                  />
                )}
              />
              <Controller
                name="addressLine2"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Address Line 2"
                    fullWidth
                    sx={{ gridColumn: { sm: "1 / -1" } }}
                    error={Boolean(errors.addressLine2)}
                    helperText={errors.addressLine2?.message}
                  />
                )}
              />
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="City"
                    fullWidth
                    error={Boolean(errors.city)}
                    helperText={errors.city?.message}
                  />
                )}
              />
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="State"
                    fullWidth
                    error={Boolean(errors.state)}
                    helperText={errors.state?.message}
                  />
                )}
              />
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Country"
                    fullWidth
                    error={Boolean(errors.country)}
                    helperText={errors.country?.message}
                  />
                )}
              />
              <Controller
                name="postalCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Postal Code"
                    fullWidth
                    error={Boolean(errors.postalCode)}
                    helperText={errors.postalCode?.message}
                  />
                )}
              />
            </Box>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardHeader title="Medical Information" />
          <Divider />
          <CardContent>
            <Stack spacing={2}>
              <Controller
                name="allergies"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Known Allergies"
                    fullWidth
                    multiline
                    minRows={2}
                    placeholder="e.g. Penicillin, Peanuts"
                    error={Boolean(errors.allergies)}
                    helperText={errors.allergies?.message}
                  />
                )}
              />
              <Controller
                name="chronicConditions"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Chronic Conditions"
                    fullWidth
                    multiline
                    minRows={2}
                    placeholder="e.g. Type 2 Diabetes, Hypertension"
                    error={Boolean(errors.chronicConditions)}
                    helperText={errors.chronicConditions?.message}
                  />
                )}
              />
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Additional Notes"
                    fullWidth
                    multiline
                    minRows={2}
                    placeholder="Any other clinically relevant information"
                    error={Boolean(errors.notes)}
                    helperText={errors.notes?.message}
                  />
                )}
              />
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardHeader title="Emergency Contact" />
          <Divider />
          <CardContent>
            <Box sx={sectionGridSx}>
              <Controller
                name="emergencyName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Contact Name"
                    fullWidth
                    error={Boolean(errors.emergencyName)}
                    helperText={errors.emergencyName?.message}
                  />
                )}
              />
              <Controller
                name="emergencyRelation"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Relationship"
                    fullWidth
                    placeholder="e.g. Spouse, Parent"
                    error={Boolean(errors.emergencyRelation)}
                    helperText={errors.emergencyRelation?.message}
                  />
                )}
              />
              <Controller
                name="emergencyMobile"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Contact Mobile"
                    fullWidth
                    error={Boolean(errors.emergencyMobile)}
                    helperText={errors.emergencyMobile?.message}
                  />
                )}
              />
            </Box>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardHeader title="Insurance" />
          <Divider />
          <CardContent>
            <Box sx={sectionGridSx}>
              <Controller
                name="insuranceProvider"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Insurance Provider"
                    fullWidth
                    error={Boolean(errors.insuranceProvider)}
                    helperText={errors.insuranceProvider?.message}
                  />
                )}
              />
              <Controller
                name="insuranceNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Policy / Insurance Number"
                    fullWidth
                    error={Boolean(errors.insuranceNumber)}
                    helperText={errors.insuranceNumber?.message}
                  />
                )}
              />
            </Box>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardHeader title="Administrative" />
          <Divider />
          <CardContent>
            <Box sx={sectionGridSx}>
              <Controller
                name="registrationDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="date"
                    label="Registration Date"
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                    helperText={errors.registrationDate?.message ?? "Defaults to today if left blank"}
                    error={Boolean(errors.registrationDate)}
                  />
                )}
              />
            </Box>
          </CardContent>
        </Card>

        <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : undefined}
          >
            {isSubmitting ? "Saving\u2026" : submitLabel}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default PatientForm;
