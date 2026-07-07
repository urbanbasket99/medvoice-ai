import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";

import type { RadiologyOrderFormValues } from "../schemas/radiologySchema";
import { PRIORITY_LABELS } from "../utils/radiologyUtils";
import { PRIORITY_OPTIONS } from "../schemas/radiologySchema";

export interface PrioritySelectorProps {
  disabled?: boolean;
}

const PrioritySelector = ({ disabled = false }: PrioritySelectorProps) => {
  const { control } = useFormContext<RadiologyOrderFormValues>();

  return (
    <Controller
      name="priority"
      control={control}
      render={({ field }) => (
        <FormControl disabled={disabled}>
          <FormLabel>Priority</FormLabel>
          <RadioGroup row {...field} value={field.value}>
            {PRIORITY_OPTIONS.map((option) => (
              <FormControlLabel
                key={option}
                value={option}
                control={<Radio size="small" />}
                label={PRIORITY_LABELS[option]}
              />
            ))}
          </RadioGroup>
        </FormControl>
      )}
    />
  );
};

export default PrioritySelector;
