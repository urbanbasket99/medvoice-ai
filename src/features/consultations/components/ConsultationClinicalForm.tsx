import type { Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Box, Card, CardContent, CardHeader, Divider, MenuItem, Stack, TextField } from "@mui/material";

import {
  CONSULTATION_STATUS_LABELS,
  CONSULTATION_STATUS_OPTIONS,
  type ConsultationFormValues,
} from "../schemas/consultationSchema";

const sectionGridSx = {
  display: "grid",
  gap: 2,
  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
} as const;

const vitalsGridSx = {
  display: "grid",
  gap: 2,
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
} as const;

export interface ConsultationClinicalFormProps {
  control: Control<ConsultationFormValues>;
  errors: FieldErrors<ConsultationFormValues>;
  readOnly?: boolean;
  showStatusField?: boolean;
}

const ConsultationClinicalForm = ({
  control,
  errors,
  readOnly = false,
  showStatusField = true,
}: ConsultationClinicalFormProps) => (
  <Stack spacing={3}>
    <Card variant="outlined">
      <CardHeader title="Chief Complaint & History" />
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
                fullWidth
                disabled={readOnly}
                error={Boolean(errors.chiefComplaint)}
                helperText={errors.chiefComplaint?.message}
              />
            )}
          />
          <Controller
            name="historyOfPresentIllness"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="History of Present Illness" multiline minRows={4} fullWidth disabled={readOnly} />
            )}
          />
          <Box sx={sectionGridSx}>
            <Controller
              name="pastMedicalHistory"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Past Medical History" multiline minRows={3} fullWidth disabled={readOnly} />
              )}
            />
            <Controller
              name="familyHistory"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Family History" multiline minRows={3} fullWidth disabled={readOnly} />
              )}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>

    <Card variant="outlined">
      <CardHeader title="Vital Signs" />
      <Divider />
      <CardContent>
        <Box sx={vitalsGridSx}>
          {(
            [
              ["bloodPressureSystolic", "Systolic BP"],
              ["bloodPressureDiastolic", "Diastolic BP"],
              ["pulse", "Pulse"],
              ["temperature", "Temp (°C)"],
              ["spo2", "SpO₂ (%)"],
              ["respiratoryRate", "Resp. Rate"],
              ["weightKg", "Weight (kg)"],
              ["heightCm", "Height (cm)"],
            ] as const
          ).map(([name, label]) => {
            const fieldError = errors.vitalSigns?.[name];
            return (
            <Controller
              key={name}
              name={`vitalSigns.${name}`}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value ?? ""}
                  label={label}
                  type="number"
                  fullWidth
                  disabled={readOnly}
                  size="small"
                  error={Boolean(fieldError)}
                  helperText={fieldError?.message}
                />
              )}
            />
            );
          })}
        </Box>
      </CardContent>
    </Card>

    <Card variant="outlined">
      <CardHeader title="Examination & Diagnosis" />
      <Divider />
      <CardContent>
        <Stack spacing={2}>
          <Controller
            name="physicalExamination"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Physical Examination" multiline minRows={4} fullWidth disabled={readOnly} />
            )}
          />
          <Box sx={sectionGridSx}>
            <Controller
              name="diagnosis"
              control={control}
              render={({ field }) => <TextField {...field} label="Diagnosis" multiline minRows={3} fullWidth disabled={readOnly} />}
            />
            <Controller
              name="assessment"
              control={control}
              render={({ field }) => <TextField {...field} label="Assessment" multiline minRows={3} fullWidth disabled={readOnly} />}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>

    <Card variant="outlined">
      <CardHeader title="Plan & Notes" />
      <Divider />
      <CardContent>
        <Stack spacing={2}>
          <Controller
            name="treatmentPlan"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Treatment Plan" multiline minRows={4} fullWidth disabled={readOnly} />
            )}
          />
          <Controller
            name="doctorNotes"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Doctor Notes" multiline minRows={4} fullWidth disabled={readOnly} />
            )}
          />
          <Box sx={sectionGridSx}>
            <Controller
              name="followUpDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Follow-up Date"
                  type="date"
                  fullWidth
                  disabled={readOnly}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />
            {showStatusField && (
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Consultation Status" fullWidth disabled={readOnly}>
                    {CONSULTATION_STATUS_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {CONSULTATION_STATUS_LABELS[option]}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            )}
          </Box>
          <Box sx={sectionGridSx}>
            <Controller
              name="allergies"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Allergies" multiline minRows={2} fullWidth disabled={readOnly} />
              )}
            />
            <Controller
              name="currentMedications"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Current Medications" multiline minRows={2} fullWidth disabled={readOnly} />
              )}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  </Stack>
);

export default ConsultationClinicalForm;
