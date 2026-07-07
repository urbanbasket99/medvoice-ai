import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import MicRoundedIcon from "@mui/icons-material/MicRounded";
import type { AxiosError } from "axios";

import AudioPlayer from "./AudioPlayer";
import RecorderControls from "./RecorderControls";
import RecordingTimer from "./RecordingTimer";
import VoiceRecordingStatusChip from "./VoiceRecordingStatusChip";
import Waveform from "./Waveform";
import {
  useStartRecordingMutation,
  useStopRecordingMutation,
  useUploadRecordingMutation,
} from "../api/voiceMutations";
import { useVoiceRecorder } from "../hooks/useVoiceRecorder";
import type { RecorderPhase, VoiceRecording } from "../types/voice.types";

const extractErrorMessage = (error: unknown): string => {
  const detail = (error as AxiosError<{ detail?: string }>)?.response?.data?.detail;
  return detail ?? "Recording action failed. Please try again.";
};

const phaseStatusLabel = (phase: RecorderPhase): string => {
  switch (phase) {
    case "idle":
      return "Ready to record";
    case "recording":
      return "Recording in progress";
    case "paused":
      return "Recording paused";
    case "stopped":
      return "Recording stopped — upload to save";
    case "uploading":
      return "Uploading audio…";
    case "completed":
      return "Recording saved";
    case "error":
      return "Recording error";
    default:
      return "";
  }
};

const VoiceRecordingPanel = ({
  consultationId,
  consultationLabel,
  compact = false,
  autoUploadOnStop = true,
  onCompleted,
}: {
  consultationId: string;
  consultationLabel?: string;
  compact?: boolean;
  autoUploadOnStop?: boolean;
  onCompleted?: (recording: VoiceRecording) => void;
}) => {
  const recorder = useVoiceRecorder();
  const startMutation = useStartRecordingMutation();
  const stopMutation = useStopRecordingMutation();
  const uploadMutation = useUploadRecordingMutation();

  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [savedRecording, setSavedRecording] = useState<VoiceRecording | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const isBusy = startMutation.isPending || stopMutation.isPending || uploadMutation.isPending || recorder.phase === "uploading";

  const handleStart = async () => {
    setActionError(null);
    setSavedRecording(null);
    try {
      const session = await startMutation.mutateAsync(consultationId);
      setRecordingId(session.id);
      await recorder.beginCapture();
    } catch (error) {
      recorder.markError(extractErrorMessage(error));
      setActionError(extractErrorMessage(error));
    }
  };

  const performUpload = async (blob: Blob, durationSeconds: number, id: string) => {
    recorder.markUploading();
    try {
      const uploaded = await uploadMutation.mutateAsync({
        recordingId: id,
        file: blob,
        durationSeconds,
        fileName: `consultation-${consultationId.slice(0, 8)}.webm`,
      });
      setSavedRecording(uploaded);
      recorder.markCompleted();
      onCompleted?.(uploaded);
    } catch (error) {
      const message = extractErrorMessage(error);
      recorder.markError(message);
      setActionError(message);
    }
  };

  const handleStop = async () => {
    if (!recordingId) return;
    setActionError(null);
    try {
      const { blob, durationSeconds } = await recorder.stopCapture();
      await stopMutation.mutateAsync({ recordingId, durationSeconds });
      if (autoUploadOnStop && blob) {
        await performUpload(blob, durationSeconds, recordingId);
      }
    } catch (error) {
      const message = extractErrorMessage(error);
      recorder.markError(message);
      setActionError(message);
    }
  };

  const handleManualUpload = async () => {
    if (!recordingId) return;
    const blob = recorder.audioBlob;
    if (!blob) {
      setActionError("No audio captured. Please record again.");
      return;
    }
    setActionError(null);
    await performUpload(blob, recorder.elapsedSeconds, recordingId);
  };

  const handleReset = () => {
    setRecordingId(null);
    setSavedRecording(null);
    setActionError(null);
    recorder.reset();
  };

  const showMic = useMemo(
    () => recorder.phase === "idle" || recorder.phase === "recording" || recorder.phase === "paused",
    [recorder.phase]
  );

  const displayStatus =
    savedRecording?.status ??
    (recorder.isRecording || recorder.isPaused
      ? "recording"
      : recorder.phase === "completed"
        ? "completed"
        : "stopped");

  return (
    <Card variant="outlined" sx={{ overflow: "hidden" }}>
      <CardContent sx={{ p: compact ? 2 : 3 }}>
        <Stack spacing={compact ? 2 : 3}>
          <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between" flexWrap="wrap">
            <Stack spacing={0.5}>
              <Typography variant={compact ? "subtitle1" : "h6"} fontWeight={700}>
                Voice Consultation Recording
              </Typography>
              {consultationLabel && (
                <Typography variant="body2" color="text.secondary">
                  {consultationLabel}
                </Typography>
              )}
            </Stack>
            <VoiceRecordingStatusChip status={displayStatus} />
          </Stack>

          {actionError && <Alert severity="error">{actionError}</Alert>}
          {recorder.errorMessage && <Alert severity="error">{recorder.errorMessage}</Alert>}

          {showMic && (
            <Box sx={{ display: "flex", justifyContent: "center", py: compact ? 1 : 2 }}>
              <Box
                sx={{
                  width: compact ? 88 : 120,
                  height: compact ? 88 : 120,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  bgcolor: recorder.isRecording ? "error.main" : "primary.main",
                  color: "primary.contrastText",
                  boxShadow: recorder.isRecording ? 6 : 2,
                  animation: recorder.isRecording ? "pulse 1.5s ease-in-out infinite" : "none",
                  "@keyframes pulse": {
                    "0%, 100%": { transform: "scale(1)" },
                    "50%": { transform: "scale(1.04)" },
                  },
                }}
              >
                <MicRoundedIcon sx={{ fontSize: compact ? 40 : 56 }} />
              </Box>
            </Box>
          )}

          <RecordingTimer seconds={recorder.elapsedSeconds} statusLabel={phaseStatusLabel(recorder.phase)} />

          <Waveform levels={recorder.waveformLevels} isActive={recorder.isRecording} />

          {recorder.phase === "uploading" && (
            <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                Saving recording to server…
              </Typography>
            </Stack>
          )}

          <RecorderControls
            phase={recorder.phase}
            canRecord={Boolean(consultationId)}
            isBusy={isBusy}
            onStart={() => void handleStart()}
            onPause={recorder.pauseCapture}
            onResume={recorder.resumeCapture}
            onStop={() => void handleStop()}
            onReset={handleReset}
            onUpload={autoUploadOnStop ? undefined : () => void handleManualUpload()}
          />

          {(savedRecording || recorder.localPreviewUrl) && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Playback
              </Typography>
              <AudioPlayer recording={savedRecording} localUrl={recorder.localPreviewUrl} />
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default VoiceRecordingPanel;
