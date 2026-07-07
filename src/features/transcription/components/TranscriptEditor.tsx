import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

import SpeakerLabels from "./SpeakerLabels";
import TranscriptTimeline from "./TranscriptTimeline";
import ConfidenceIndicator from "./ConfidenceIndicator";
import { averageConfidence } from "../utils/transcriptionUtils";
import type { Transcription, TranscriptSegment } from "../types/transcription.types";

const TranscriptEditor = ({
  transcription,
  canEdit,
  isSaving,
  onSave,
}: {
  transcription: Transcription;
  canEdit: boolean;
  isSaving?: boolean;
  onSave: (transcript: string, segments: TranscriptSegment[]) => void | Promise<void>;
}) => {
  const [transcript, setTranscript] = useState(transcription.transcript ?? "");
  const [segments, setSegments] = useState<TranscriptSegment[]>(transcription.segments ?? []);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    setTranscript(transcription.transcript ?? "");
    setSegments(transcription.segments ?? []);
  }, [transcription]);

  const overallConfidence = useMemo(() => averageConfidence(segments), [segments]);

  const handleSegmentTextChange = (index: number, text: string) => {
    setSegments((current) => {
      const updated = current.map((segment) => (segment.index === index ? { ...segment, text } : segment));
      setTranscript(updated.map((segment) => segment.text.trim()).filter(Boolean).join("\n\n"));
      return updated;
    });
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Transcript
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Model: {transcription.modelUsed ?? "—"}
            {transcription.durationSeconds != null ? ` · ${Math.round(transcription.durationSeconds)}s` : ""}
          </Typography>
        </Box>
        <ConfidenceIndicator confidence={overallConfidence} label="Overall confidence" />
      </Stack>

      <SpeakerLabels segments={segments} activeIndex={activeIndex} onSelect={setActiveIndex} />

      <TextField
        label="Full transcript"
        multiline
        minRows={6}
        fullWidth
        value={transcript}
        onChange={(event) => setTranscript(event.target.value)}
        disabled={!canEdit || transcription.status !== "completed"}
      />

      {segments.length > 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Timeline
          </Typography>
          <TranscriptTimeline
            segments={segments.map((segment) =>
              activeIndex === segment.index ? { ...segment, text: segments.find((s) => s.index === segment.index)?.text ?? segment.text } : segment
            )}
            activeIndex={activeIndex}
            onSelect={setActiveIndex}
          />
          {activeIndex != null && canEdit && (
            <TextField
              label={`Edit segment ${activeIndex + 1}`}
              multiline
              minRows={2}
              fullWidth
              sx={{ mt: 2 }}
              value={segments.find((segment) => segment.index === activeIndex)?.text ?? ""}
              onChange={(event) => handleSegmentTextChange(activeIndex, event.target.value)}
            />
          )}
        </Box>
      )}

      {canEdit && transcription.status === "completed" && (
        <Button
          variant="contained"
          startIcon={<SaveRoundedIcon />}
          disabled={isSaving || !transcript.trim()}
          onClick={() => void onSave(transcript.trim(), segments)}
        >
          {isSaving ? "Saving…" : "Save Transcript"}
        </Button>
      )}

      {transcription.status === "failed" && transcription.errorMessage && (
        <Alert severity="error">{transcription.errorMessage}</Alert>
      )}
    </Stack>
  );
};

export default TranscriptEditor;
