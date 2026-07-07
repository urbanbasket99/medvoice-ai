import { Controller, useFormContext } from "react-hook-form";
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

import { FREQUENCY_OPTIONS, ROUTE_OPTIONS } from "../schemas/prescriptionSchema";
import type { PrescriptionFormValues } from "../schemas/prescriptionSchema";
import { FREQUENCY_LABELS, ROUTE_LABELS } from "../utils/prescriptionUtils";
import MedicineSearch from "./MedicineSearch";
import type { MedicineMaster } from "../types/prescription.types";

export interface MedicineSelectorProps {
  index: number;
  onRemove: () => void;
  canRemove: boolean;
  disabled?: boolean;
}

const MedicineSelector = ({ index, onRemove, canRemove, disabled }: MedicineSelectorProps) => {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<PrescriptionFormValues>();

  const itemErrors = errors.items?.[index];

  const handleMedicineSelect = (medicine: MedicineMaster) => {
    setValue(`items.${index}.medicineMasterId`, medicine.id);
    setValue(`items.${index}.medicineName`, medicine.name);
    if (medicine.strength) {
      setValue(`items.${index}.strength`, medicine.strength);
    }
    if (medicine.defaultRoute) {
      setValue(`items.${index}.route`, medicine.defaultRoute);
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.paper",
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start", justifyContent: "space-between" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, pt: 1 }}>
            Medicine {index + 1}
          </Typography>
          {canRemove && (
            <IconButton size="small" color="error" onClick={onRemove} disabled={disabled} aria-label="Remove medicine">
              <DeleteOutlineRoundedIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          }}
        >
          <Controller
            name={`items.${index}.medicineName`}
            control={control}
            render={({ field }) => (
              <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
                <MedicineSearch
                  value={field.value}
                  onChange={(value) => {
                    if (typeof value === "string") {
                      field.onChange(value);
                      setValue(`items.${index}.medicineMasterId`, null);
                    } else if (value) {
                      field.onChange(value.name);
                    } else {
                      field.onChange("");
                      setValue(`items.${index}.medicineMasterId`, null);
                    }
                  }}
                  onSelect={handleMedicineSelect}
                  disabled={disabled}
                  error={Boolean(itemErrors?.medicineName)}
                  helperText={itemErrors?.medicineName?.message}
                />
              </Box>
            )}
          />

          <Controller
            name={`items.${index}.strength`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Strength"
                fullWidth
                disabled={disabled}
                error={Boolean(itemErrors?.strength)}
                helperText={itemErrors?.strength?.message}
              />
            )}
          />

          <Controller
            name={`items.${index}.dosage`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Dosage"
                fullWidth
                disabled={disabled}
                error={Boolean(itemErrors?.dosage)}
                helperText={itemErrors?.dosage?.message}
              />
            )}
          />

          <Controller
            name={`items.${index}.frequency`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Frequency"
                required
                fullWidth
                disabled={disabled}
                error={Boolean(itemErrors?.frequency)}
                helperText={itemErrors?.frequency?.message}
              >
                {FREQUENCY_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {FREQUENCY_LABELS[option]}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Controller
            name={`items.${index}.route`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Route"
                required
                fullWidth
                disabled={disabled}
                error={Boolean(itemErrors?.route)}
                helperText={itemErrors?.route?.message}
              >
                {ROUTE_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {ROUTE_LABELS[option]}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Controller
            name={`items.${index}.duration`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Duration"
                fullWidth
                placeholder="e.g. 5 days"
                disabled={disabled}
                error={Boolean(itemErrors?.duration)}
                helperText={itemErrors?.duration?.message}
              />
            )}
          />

          <Controller
            name={`items.${index}.quantity`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Quantity"
                fullWidth
                disabled={disabled}
                error={Boolean(itemErrors?.quantity)}
                helperText={itemErrors?.quantity?.message}
              />
            )}
          />

          <Controller
            name={`items.${index}.instructions`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Instructions"
                fullWidth
                multiline
                minRows={2}
                disabled={disabled}
                sx={{ gridColumn: { sm: "1 / -1" } }}
                error={Boolean(itemErrors?.instructions)}
                helperText={itemErrors?.instructions?.message}
              />
            )}
          />
        </Box>

        <FormControl component="fieldset" variant="standard" error={Boolean(itemErrors?.dosageInstruction)}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
            Dosage schedule
          </Typography>
          <FormGroup row sx={{ gap: 1, flexWrap: "wrap" }}>
            {(
              [
                ["morning", "Morning (M)"],
                ["afternoon", "Afternoon (A)"],
                ["night", "Night (N)"],
                ["beforeFood", "Before food"],
                ["afterFood", "After food"],
              ] as const
            ).map(([key, label]) => (
              <Controller
                key={key}
                name={`items.${index}.dosageInstruction.${key}`}
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} disabled={disabled} size="small" />}
                    label={label}
                  />
                )}
              />
            ))}
          </FormGroup>
          {itemErrors?.dosageInstruction && <FormHelperText>Check dosage schedule options</FormHelperText>}
        </FormControl>
      </Stack>
    </Box>
  );
};

export default MedicineSelector;
