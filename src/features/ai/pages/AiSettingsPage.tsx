import { Alert, Box, Button, Skeleton, Stack, Typography } from "@mui/material";

import { useAuth } from "../../auth";
import AiSettingsForm from "../components/AiSettingsForm";
import { useAiProviders } from "../hooks/useAiProviders";

const AiSettingsPage = () => {
  const { user } = useAuth();
  const canUpdate = Boolean(user?.isSuperuser || user?.permissions.includes("ai:update"));
  const canTest = Boolean(user?.isSuperuser || user?.permissions.includes("ai:test"));
  const providersQuery = useAiProviders();

  if (providersQuery.isLoading) {
    return (
      <Stack spacing={2}>
        <Skeleton variant="rounded" height={48} />
        <Skeleton variant="rounded" height={320} />
        <Skeleton variant="rounded" height={180} />
      </Stack>
    );
  }

  if (providersQuery.isError || !providersQuery.data) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => void providersQuery.refetch()}>
            Retry
          </Button>
        }
      >
        Could not load AI settings.
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          AI Engine Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage provider configuration, defaults, and connectivity for the reusable MedVoice AI abstraction layer.
        </Typography>
      </Box>

      <AiSettingsForm catalog={providersQuery.data} canUpdate={canUpdate} canTest={canTest} />
    </Stack>
  );
};

export default AiSettingsPage;
