import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../auth";
import { voiceApi } from "../../voice/api/voiceApi";
import { extractApiErrorMessage } from "../../../lib/extractApiErrorMessage";
import { useStartTranscription, useRetryTranscription } from "../hooks/useTranscriptionMutations";
import { useTranscriptionByRecording } from "../hooks/useTranscriptions";
import type { Consultation } from "../../consultations/types/consultation.types";

const ConsultationTranscriptionPanel = ({ consultation }: { consultation: Consultation }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canCreate = Boolean(user?.isSuperuser || user?.permissions.includes("transcriptions:create"));
  const canRead = Boolean(user?.isSuperuser || user?.permissions.includes("transcriptions:read"));

  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const startTranscription = useStartTranscription();
  const retryTranscription = useRetryTranscription();

  useEffect(() => {
    let active = true;
    const loadLatestRecording = async () => {
      try {
        const result = await voiceApi.list({
          consultationId: consultation.id,
          status: "completed",
          page: 1,
          pageSize: 1,
          sortBy: "created_at",
          sortDir: "desc",
        });
        if (active) setRecordingId(result.items[0]?.id ?? null);
      } catch {
        if (active) setRecordingId(null);
      }
    };
    void loadLatestRecording();
    return () => {
      active = false;
    };
  }, [consultation.id]);

  const transcriptionQuery = useTranscriptionByRecording(recordingId ?? undefined);

  const isBusy = useMemo(
    () =>
      startTranscription.isPending ||
      retryTranscription.isPending ||
      transcriptionQuery.data?.status === "processing" ||
      transcriptionQuery.data?.status === "pending",
    [startTranscription.isPending, retryTranscription.isPending, transcriptionQuery.data?.status]
  );

  useEffect(() => {
    if (!recordingId) return undefined;
    if (transcriptionQuery.data?.status !== "processing" && transcriptionQuery.data?.status !== "pending") {
      return undefined;
    }
    const timer = window.setInterval(() => {
      void transcriptionQuery.refetch();
    }, 2500);
    return () => window.clearInterval(timer);
  }, [recordingId, transcriptionQuery.data?.status, transcriptionQuery.refetch]);

  const handleGenerate = async () => {
    if (!recordingId) {
      setFeedback("Save a voice recording first, then generate a transcript.");
      return;
    }
    setFeedback(null);
    try {
      await startTranscription.mutateAsync({ recordingId });
      await transcriptionQuery.refetch();
    } catch (error) {
      setFeedback(extractApiErrorMessage(error, "Transcription request failed."));
    }
  };

  const handleRetry = async () => {
    if (!transcriptionQuery.data) return;
    setFeedback(null);
    try {
      await retryTranscription.mutateAsync(transcriptionQuery.data.id);
      await transcriptionQuery.refetch();
    } catch (error) {
      setFeedback(extractApiErrorMessage(error, "Transcription request failed."));
    }
  };

  if (!canCreate && !canRead) return null;

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <ArticleRoundedIcon color="primary" />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Consultation Transcript
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Convert saved consultation audio to text using the AI Engine Whisper provider.
                </Typography>
              </Box>
            </Stack>
          </Stack>

          {!recordingId && (
            <Alert severity="info">Complete a voice recording for this consultation to enable transcription.</Alert>
          )}

          {feedback && <Alert severity="error">{feedback}</Alert>}

          {isBusy && (
            <Stack spacing={1}>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary">
                Transcribing audio…
              </Typography>
            </Stack>
          )}

          {transcriptionQuery.data?.status === "failed" && (
            <Alert severity="error" action={canCreate ? <Button onClick={() => void handleRetry()}>Retry</Button> : undefined}>
              {transcriptionQuery.data.errorMessage ?? "Transcription failed."}
            </Alert>
          )}

          {transcriptionQuery.data?.status === "completed" && (
            <Alert severity="success">
              Transcript ready
              {transcriptionQuery.data.transcript
                ? `: ${transcriptionQuery.data.transcript.slice(0, 120)}${transcriptionQuery.data.transcript.length > 120 ? "…" : ""}`
                : "."}
            </Alert>
          )}

          <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap" }}>
            {canCreate && (
              <Button
                variant="contained"
                startIcon={
                  startTranscription.isPending ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeRoundedIcon />
                }
                disabled={!recordingId || isBusy}
                onClick={() => void handleGenerate()}
              >
                Generate Transcript
              </Button>
            )}
            {canRead && transcriptionQuery.data && (
              <Button
                variant="outlined"
                startIcon={<VisibilityRoundedIcon />}
                onClick={() => navigate(`/transcriptions/${transcriptionQuery.data?.id}`)}
              >
                View Transcript
              </Button>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ConsultationTranscriptionPanel;
