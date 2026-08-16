import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../auth";
import PageHeader from "../../../components/ui/PageHeader";
import { extractApiErrorMessage } from "../../../lib/extractApiErrorMessage";
import TranscriptEditor from "../components/TranscriptEditor";
import {
  useDeleteTranscription,
  useRetryTranscription,
  useUpdateTranscription,
} from "../hooks/useTranscriptionMutations";
import { useTranscription } from "../hooks/useTranscriptions";

const TranscriptionViewerPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canUpdate = Boolean(user?.isSuperuser || user?.permissions.includes("transcriptions:update"));
  const canDelete = Boolean(user?.isSuperuser || user?.permissions.includes("transcriptions:delete"));
  const canCreate = Boolean(user?.isSuperuser || user?.permissions.includes("transcriptions:create"));

  const transcriptionQuery = useTranscription(id);
  const updateTranscription = useUpdateTranscription();
  const deleteTranscription = useDeleteTranscription();
  const retryTranscription = useRetryTranscription();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const transcription = transcriptionQuery.data;
  const isProcessing = transcription?.status === "processing" || transcription?.status === "pending";

  useEffect(() => {
    if (!id || !isProcessing) return undefined;
    const timer = window.setInterval(() => {
      void transcriptionQuery.refetch();
    }, 3000);
    return () => window.clearInterval(timer);
  }, [id, isProcessing, transcriptionQuery.refetch]);

  const handleSave = async (transcript: string, segments: typeof transcription extends undefined ? never : NonNullable<typeof transcription>["segments"]) => {
    if (!id) return;
    setFeedback(null);
    try {
      await updateTranscription.mutateAsync({ id, payload: { transcript, segments } });
      setFeedback({ type: "success", message: "Transcript saved successfully." });
    } catch (error) {
      setFeedback({ type: "error", message: extractApiErrorMessage(error, "Request failed.") });
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteTranscription.mutateAsync(id);
      navigate("/transcriptions");
    } catch (error) {
      setFeedback({ type: "error", message: extractApiErrorMessage(error, "Request failed.") });
    }
  };

  const handleRetry = async () => {
    if (!id) return;
    try {
      await retryTranscription.mutateAsync(id);
      await transcriptionQuery.refetch();
    } catch (error) {
      setFeedback({ type: "error", message: extractApiErrorMessage(error, "Request failed.") });
    }
  };

  if (transcriptionQuery.isLoading) {
    return (
      <Stack sx={{ alignItems: "center", py: 6 }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (transcriptionQuery.isError || !transcription) {
    return (
      <Alert severity="error" action={<Button onClick={() => void transcriptionQuery.refetch()}>Retry</Button>}>
        Transcription not found.
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Transcription Viewer"
        subtitle={`${transcription.consultationVisitNumber ?? transcription.consultationId} · ${transcription.patientName ?? "Patient"}`}
      />

      {feedback && (
        <Alert severity={feedback.type} onClose={() => setFeedback(null)}>
          {feedback.message}
        </Alert>
      )}

      {transcription.status === "failed" && transcription.errorMessage && (
        <Alert
          severity="error"
          action={
            canCreate ? (
              <Button color="inherit" size="small" onClick={() => void handleRetry()}>
                Retry
              </Button>
            ) : undefined
          }
        >
          {transcription.errorMessage}
        </Alert>
      )}

      {isProcessing && (
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={1}>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary">
                Speech-to-text in progress…
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

      <Card variant="outlined">
        <CardContent>
          <TranscriptEditor
            transcription={transcription}
            canEdit={canUpdate}
            isSaving={updateTranscription.isPending}
            onSave={handleSave}
          />
        </CardContent>
      </Card>

      <Stack direction="row" spacing={1.5}>
        {canCreate && transcription.status === "failed" && (
          <Button startIcon={<RefreshRoundedIcon />} onClick={() => void handleRetry()}>
            Retry Transcription
          </Button>
        )}
        {canDelete && (
          <Button color="error" startIcon={<DeleteOutlineRoundedIcon />} onClick={() => void handleDelete()}>
            Delete Transcript
          </Button>
        )}
      </Stack>
    </Stack>
  );
};

export default TranscriptionViewerPage;
