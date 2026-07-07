import { useMemo, useRef, useState } from "react";
import {
  Alert,
  Autocomplete,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";

import { useConsultations } from "../../consultations/hooks/useConsultations";
import type { Consultation } from "../../consultations/types/consultation.types";
import { extractApiErrorMessage } from "../../../lib/extractApiErrorMessage";
import { useUploadTranscription, useStartTranscription } from "../hooks/useTranscriptionMutations";

const AudioUploadCard = ({ onUploaded }: { onUploaded?: () => void }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [language, setLanguage] = useState("en");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const upload = useUploadTranscription();
  const start = useStartTranscription();

  const consultationsQuery = useConsultations({
    page: 1,
    pageSize: 100,
    sortBy: "created_at",
    sortDir: "desc",
  });

  const consultations = useMemo(
    () =>
      (consultationsQuery.data?.items ?? []).filter(
        (item) => item.status === "draft" || item.status === "in_progress" || item.status === "completed"
      ),
    [consultationsQuery.data?.items]
  );

  const handleUpload = async (file: File) => {
    if (!selectedConsultation) {
      setFeedback({ type: "error", message: "Select a consultation before uploading audio." });
      return;
    }

    setFeedback(null);
    try {
      const transcription = await upload.mutateAsync({
        consultationId: selectedConsultation.id,
        file,
        language: language.trim() || undefined,
      });
      await start.mutateAsync({ transcriptionId: transcription.id, language: language.trim() || undefined });
      onUploaded?.();
      setFeedback({
        type: "success",
        message: "Audio uploaded. Transcription is running — status will update in the list below.",
      });
    } catch (error) {
      setFeedback({ type: "error", message: extractApiErrorMessage(error, "Upload failed.") });
    }
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Upload Audio
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload consultation audio directly when not using the in-app voice recorder.
          </Typography>
          {feedback && (
            <Alert severity={feedback.type} onClose={() => setFeedback(null)}>
              {feedback.message}
            </Alert>
          )}
          <Autocomplete
            options={consultations}
            value={selectedConsultation}
            loading={consultationsQuery.isLoading}
            onChange={(_, value) => setSelectedConsultation(value)}
            getOptionLabel={(option) => `${option.visitNumber} — ${option.patientName ?? "Patient"}`}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Consultation"
                placeholder="Select a consultation"
                helperText="Choose by visit number (e.g. VIS-000002) and patient name — no UUID needed."
              />
            )}
          />
          {consultationsQuery.isLoading && (
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                Loading consultations…
              </Typography>
            </Stack>
          )}
          <TextField label="Language" value={language} onChange={(event) => setLanguage(event.target.value)} fullWidth />
          <Button
            variant="outlined"
            startIcon={<UploadFileRoundedIcon />}
            disabled={!selectedConsultation || upload.isPending || start.isPending}
            onClick={() => inputRef.current?.click()}
          >
            {upload.isPending || start.isPending ? "Processing…" : "Choose Audio File"}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="audio/*,video/webm"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleUpload(file);
              event.target.value = "";
            }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default AudioUploadCard;
