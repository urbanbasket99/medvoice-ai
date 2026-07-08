import { Alert, Button, Skeleton, Stack } from "@mui/material";

import PageHeader from "../../../components/ui/PageHeader";
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
      <Stack spacing={3}>
        <PageHeader title="AI Engine Settings" subtitle="Manage provider configuration and connectivity." />
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
      <PageHeader
        title="AI Engine Settings"
        subtitle="Manage provider configuration, defaults, and connectivity for the reusable MedVoice AI abstraction layer."
      />

      <AiSettingsForm catalog={providersQuery.data} canUpdate={canUpdate} canTest={canTest} />
    </Stack>
  );
};

export default AiSettingsPage;
