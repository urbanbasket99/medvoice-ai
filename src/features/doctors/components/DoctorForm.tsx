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
  DEPARTMENT_LABELS,
  DEPARTMENT_OPTIONS,
  DOCTOR_STATUS_LABELS,
  DOCTOR_STATUS_OPTIONS,
  GENDER_OPTIONS,
  doctorFormSchema,
} from "../schemas/doctorSchema";
import type { DoctorFormValues } from "../schemas/doctorSchema";

export interface DoctorFormProps {
  defaultValues: DoctorFormValues;
  onSubmit: (values: DoctorFormValues) => Promise<void> | void;
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

const DoctorForm = ({
  defaultValues,
  onSubmit,
  submitLabel = "Save Doctor",
  isSubmitting = false,
  serverError,
  showStatusField = false,
}: DoctorFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
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
                name="fullName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Full Name"
                    required
                    fullWidth
                    sx={{ gridColumn: { sm: "1 / -1" } }}
                    error={Boolean(errors.fullName)}
                    helperText={errors.fullName?.message}
                  />
                )}
              />
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Gender" required fullWidth error={Boolean(errors.gender)} helperText={errors.gender?.message}>
                    {GENDER_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {GENDER_LABEL[option]}
                      </MenuItem>
                    ))}
                  </TextField>
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
                name="photoUrl"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Photo URL"
                    fullWidth
                    sx={{ gridColumn: { sm: "1 / -1" } }}
                    error={Boolean(errors.photoUrl)}
                    helperText={errors.photoUrl?.message}
                  />
                )}
              />
            </Box>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardHeader title="Professional Information" />
          <Divider />
          <CardContent>
            <Box sx={sectionGridSx}>
              <Controller
                name="department"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Department" required fullWidth error={Boolean(errors.department)} helperText={errors.department?.message}>
                    {DEPARTMENT_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {DEPARTMENT_LABELS[option]}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <Controller
                name="specialization"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Specialization" required fullWidth error={Boolean(errors.specialization)} helperText={errors.specialization?.message} />
                )}
              />
              <Controller
                name="qualification"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Qualification" required fullWidth error={Boolean(errors.qualification)} helperText={errors.qualification?.message} />
                )}
              />
              <Controller
                name="registrationNumber"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Registration Number" required fullWidth error={Boolean(errors.registrationNumber)} helperText={errors.registrationNumber?.message} />
                )}
              />
              <Controller
                name="experienceYears"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Experience (Years)"
                    required
                    fullWidth
                    error={Boolean(errors.experienceYears)}
                    helperText={errors.experienceYears?.message}
                  />
                )}
              />
              <Controller
                name="consultationFee"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Consultation Fee" fullWidth error={Boolean(errors.consultationFee)} helperText={errors.consultationFee?.message} />
                )}
              />
              <Controller
                name="workingHours"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Working Hours"
                    fullWidth
                    placeholder="e.g. Mon–Fri 9:00 AM – 5:00 PM"
                    error={Boolean(errors.workingHours)}
                    helperText={errors.workingHours?.message}
                  />
                )}
              />
              <Controller
                name="joiningDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="date"
                    label="Joining Date"
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={Boolean(errors.joiningDate)}
                    helperText={errors.joiningDate?.message}
                  />
                )}
              />
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
                  <TextField {...field} label="Mobile" required fullWidth error={Boolean(errors.mobile)} helperText={errors.mobile?.message} />
                )}
              />
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Email" fullWidth error={Boolean(errors.email)} helperText={errors.email?.message} />
                )}
              />
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Address"
                    fullWidth
                    multiline
                    minRows={2}
                    sx={{ gridColumn: { sm: "1 / -1" } }}
                    error={Boolean(errors.address)}
                    helperText={errors.address?.message}
                  />
                )}
              />
              <Controller
                name="languagesSpoken"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Languages Spoken"
                    fullWidth
                    placeholder="English, Hindi, Telugu"
                    sx={{ gridColumn: { sm: "1 / -1" } }}
                    error={Boolean(errors.languagesSpoken)}
                    helperText={errors.languagesSpoken?.message ?? "Comma-separated list"}
                  />
                )}
              />
            </Box>
          </CardContent>
        </Card>

        {showStatusField && (
          <Card variant="outlined">
            <CardHeader title="Administrative" />
            <Divider />
            <CardContent>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Status" fullWidth sx={{ maxWidth: 280 }} error={Boolean(errors.status)} helperText={errors.status?.message}>
                    {DOCTOR_STATUS_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {DOCTOR_STATUS_LABELS[option]}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </CardContent>
          </Card>
        )}

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button type="submit" variant="contained" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : undefined}>
            {submitLabel}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default DoctorForm;
