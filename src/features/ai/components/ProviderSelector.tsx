import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { Controller, type Control } from "react-hook-form";

import type { AiProvider } from "../types/ai.types";
import type { AiSettingsFormValues } from "../schemas/aiSettingsSchema";

const ProviderSelector = ({
  control,
  providers,
  disabled,
}: {
  control: Control<AiSettingsFormValues>;
  providers: AiProvider[];
  disabled?: boolean;
}) => (
  <Controller
    name="activeProvider"
    control={control}
    render={({ field, fieldState }) => (
      <FormControl fullWidth error={Boolean(fieldState.error)} disabled={disabled}>
        <InputLabel id="ai-provider-label">Provider</InputLabel>
        <Select {...field} labelId="ai-provider-label" label="Provider">
          {providers.map((provider) => (
            <MenuItem
              key={provider.id}
              value={provider.id}
              disabled={provider.status !== "active"}
            >
              <Stack>
                <Typography variant="body2">{provider.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {provider.status === "active"
                    ? "Active"
                    : provider.status === "placeholder"
                      ? "Coming soon"
                      : "Unavailable"}
                </Typography>
              </Stack>
            </MenuItem>
          ))}
        </Select>
        {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
        <FormHelperText>Only OpenAI is active in this release. Other providers are reserved for future use.</FormHelperText>
      </FormControl>
    )}
  />
);

export default ProviderSelector;
