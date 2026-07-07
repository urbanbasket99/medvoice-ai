import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import ScienceRoundedIcon from "@mui/icons-material/ScienceRounded";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { AxiosError } from "axios";

import { ApiKeyStatus, HealthStatusPanel } from "./AiStatusPanels";
import ProviderSelector from "./ProviderSelector";
import { useAiHealth, useAiModels } from "../hooks/useAiProviders";
import { useTestAi, useUpdateAiSettings } from "../hooks/useUpdateAiSettings";
import { aiSettingsSchema, type AiSettingsFormValues } from "../schemas/aiSettingsSchema";
import type { AiProvidersCatalog } from "../types/ai.types";

const extractErrorMessage = (error: unknown): string => {
  const detail = (error as AxiosError<{ detail?: string }>)?.response?.data?.detail;
  return detail ?? "Request failed. Please try again.";
};

const AiSettingsForm = ({
  catalog,
  canUpdate,
  canTest,
}: {
  catalog: AiProvidersCatalog;
  canUpdate: boolean;
  canTest: boolean;
}) => {
  const updateSettings = useUpdateAiSettings();
  const testAi = useTestAi();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [testPrompt, setTestPrompt] = useState("Reply with one short sentence confirming MedVoice AI connectivity.");
  const [testResult, setTestResult] = useState<string | null>(null);

  const defaultValues = useMemo<AiSettingsFormValues>(
    () => ({
      activeProvider: catalog.settings.activeProvider,
      model: catalog.settings.model,
      temperature: catalog.settings.temperature,
      maxTokens: catalog.settings.maxTokens,
    }),
    [catalog.settings]
  );

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { isDirty },
  } = useForm<AiSettingsFormValues>({
    resolver: zodResolver(aiSettingsSchema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const activeProvider = watch("activeProvider");
  const modelsQuery = useAiModels(activeProvider);
  const healthQuery = useAiHealth(activeProvider);

  const onSave = async (values: AiSettingsFormValues) => {
    setFeedback(null);
    try {
      await updateSettings.mutateAsync({
        activeProvider: values.activeProvider,
        model: values.model,
        temperature: values.temperature,
        maxTokens: values.maxTokens,
      });
      setFeedback({ type: "success", message: "AI settings saved successfully." });
    } catch (error) {
      setFeedback({ type: "error", message: extractErrorMessage(error) });
    }
  };

  const onTest = async (values: AiSettingsFormValues) => {
    setFeedback(null);
    setTestResult(null);
    try {
      const result = await testAi.mutateAsync({
        prompt: testPrompt,
        providerId: values.activeProvider,
        model: values.model,
        temperature: values.temperature,
        maxTokens: Math.min(values.maxTokens, 256),
      });
      setTestResult(result.text);
      void healthQuery.refetch();
    } catch (error) {
      setFeedback({ type: "error", message: extractErrorMessage(error) });
    }
  };

  return (
    <Stack spacing={3}>
      {feedback && (
        <Alert severity={feedback.type} onClose={() => setFeedback(null)}>
          {feedback.message}
        </Alert>
      )}

      <ApiKeyStatus configured={catalog.settings.apiKeyConfigured} />

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Provider & Model
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure the active AI provider and generation defaults for future MedVoice AI features.
              </Typography>
            </Box>

            <ProviderSelector
              control={control}
              providers={catalog.providers}
              disabled={!canUpdate || updateSettings.isPending}
            />

            <Controller
              name="model"
              control={control}
              render={({ field, fieldState }) => (
                <FormControl fullWidth error={Boolean(fieldState.error)}>
                  <InputLabel id="ai-model-label">Model</InputLabel>
                  <Select
                    {...field}
                    labelId="ai-model-label"
                    label="Model"
                    disabled={!canUpdate || modelsQuery.isLoading}
                  >
                    {(modelsQuery.data ?? []).map((model) => (
                      <MenuItem key={model.id} value={model.id}>
                        {model.name}
                        {model.isDefault ? " (default)" : ""}
                      </MenuItem>
                    ))}
                    {!modelsQuery.data?.length && (
                      <MenuItem value={field.value}>{field.value}</MenuItem>
                    )}
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name="temperature"
              control={control}
              render={({ field }) => (
                <Box>
                  <Typography gutterBottom>Temperature: {field.value.toFixed(2)}</Typography>
                  <Slider
                    value={field.value}
                    min={0}
                    max={2}
                    step={0.05}
                    onChange={(_, value) => field.onChange(value as number)}
                    disabled={!canUpdate}
                  />
                </Box>
              )}
            />

            <Controller
              name="maxTokens"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="number"
                  label="Max Tokens"
                  fullWidth
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message ?? "Upper bound for generated tokens."}
                  disabled={!canUpdate}
                  onChange={(event) => field.onChange(Number(event.target.value))}
                />
              )}
            />

            <HealthStatusPanel health={healthQuery.data} isLoading={healthQuery.isLoading} />

            <Stack direction="row" spacing={1.5} flexWrap="wrap">
              {canUpdate && (
                <Button
                  variant="contained"
                  startIcon={updateSettings.isPending ? <CircularProgress size={18} color="inherit" /> : <SaveRoundedIcon />}
                  onClick={() => void handleSubmit(onSave)()}
                  disabled={!isDirty || updateSettings.isPending}
                >
                  Save Settings
                </Button>
              )}
              {canTest && (
                <Button
                  variant="outlined"
                  startIcon={testAi.isPending ? <CircularProgress size={18} /> : <ScienceRoundedIcon />}
                  onClick={() => void handleSubmit(onTest)()}
                  disabled={testAi.isPending || !catalog.settings.apiKeyConfigured}
                >
                  Run Test
                </Button>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {canTest && (
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={700}>
                Connection Test
              </Typography>
              <TextField
                label="Test Prompt"
                multiline
                minRows={2}
                value={testPrompt}
                onChange={(event) => setTestPrompt(event.target.value)}
                fullWidth
              />
              {testResult && (
                <Alert severity="success">
                  <Typography variant="subtitle2" gutterBottom>
                    Model response
                  </Typography>
                  {testResult}
                </Alert>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

      <Alert severity="info">
        Whisper model configured as <strong>{catalog.settings.whisperModel}</strong> for future speech-to-text work.
        No transcription is performed in this release.
      </Alert>
    </Stack>
  );
};

export default AiSettingsForm;
