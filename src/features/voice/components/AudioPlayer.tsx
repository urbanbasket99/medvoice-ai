import { useEffect, useState } from "react";
import { Alert, Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";

import { voiceApi } from "../api/voiceApi";
import { formatFileSize, formatRecordingDuration, triggerBlobDownload } from "../utils/voiceUtils";
import type { VoiceRecording } from "../types/voice.types";

const AudioPlayer = ({
  recording,
  localUrl,
}: {
  recording?: VoiceRecording | null;
  localUrl?: string | null;
}) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(localUrl ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (localUrl) {
      setAudioUrl(localUrl);
      return undefined;
    }

    if (!recording || recording.status !== "completed") {
      setAudioUrl(null);
      return undefined;
    }

    let revoked = false;
    let objectUrl: string | null = null;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const blob = await voiceApi.downloadBlob(recording.id);
        if (revoked) return;
        objectUrl = URL.createObjectURL(blob);
        setAudioUrl(objectUrl);
      } catch {
        if (!revoked) setError("Could not load audio for playback.");
      } finally {
        if (!revoked) setIsLoading(false);
      }
    };

    void load();

    return () => {
      revoked = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [recording?.id, recording?.status, localUrl]);

  const handleDownload = async () => {
    if (localUrl && recording == null) {
      const response = await fetch(localUrl);
      const blob = await response.blob();
      triggerBlobDownload(blob, "recording.webm");
      return;
    }
    if (!recording) return;
    try {
      const blob = await voiceApi.downloadBlob(recording.id);
      triggerBlobDownload(blob, recording.fileName ?? `${recording.id}.webm`);
    } catch {
      setError("Could not download the recording.");
    }
  };

  if (isLoading) {
    return (
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ py: 2 }}>
        <CircularProgress size={22} />
        <Typography variant="body2" color="text.secondary">
          Loading audio…
        </Typography>
      </Stack>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!audioUrl) {
    return null;
  }

  return (
    <Stack spacing={1.5}>
      <Box
        component="audio"
        controls
        src={audioUrl}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        sx={{ width: "100%" }}
      />
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" flexWrap="wrap">
        <Typography variant="body2" color="text.secondary">
          {recording?.durationSeconds != null ? formatRecordingDuration(recording.durationSeconds) : "Preview"}
          {recording?.fileSizeBytes != null ? ` · ${formatFileSize(recording.fileSizeBytes)}` : ""}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            startIcon={isPlaying ? <StopRoundedIcon /> : <PlayArrowRoundedIcon />}
            onClick={() => {
              const element = document.querySelector<HTMLAudioElement>(`audio[src="${audioUrl}"]`);
              if (!element) return;
              if (element.paused) void element.play();
              else element.pause();
            }}
          >
            {isPlaying ? "Pause" : "Play"}
          </Button>
          <Button size="small" variant="outlined" startIcon={<DownloadRoundedIcon />} onClick={() => void handleDownload()}>
            Download
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default AudioPlayer;
