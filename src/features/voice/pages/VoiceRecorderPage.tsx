import { useMemo } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "../../auth";
import { useConsultations } from "../../consultations/hooks/useConsultations";
import type { Consultation } from "../../consultations/types/consultation.types";
import VoiceRecordingPanel from "../components/VoiceRecordingPanel";

const VoiceRecorderPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const canRecord = Boolean(user?.isSuperuser || user?.permissions.includes("voice:record"));

  const consultationIdParam = searchParams.get("consultationId") ?? "";

  const consultationsQuery = useConsultations({
    page: 1,
    pageSize: 100,
    sortBy: "created_at",
    sortDir: "desc",
  });

  const consultations = useMemo(
    () =>
      (consultationsQuery.data?.items ?? []).filter(
        (item) => item.status === "draft" || item.status === "in_progress"
      ),
    [consultationsQuery.data?.items]
  );

  const selectedConsultation = useMemo(
    () => consultations.find((item) => item.id === consultationIdParam) ?? null,
    [consultations, consultationIdParam]
  );

  const handleConsultationChange = (consultation: Consultation | null) => {
    if (consultation) {
      setSearchParams({ consultationId: consultation.id });
    } else {
      setSearchParams({});
    }
  };

  if (!canRecord) {
    return <Alert severity="warning">You do not have permission to record consultations.</Alert>;
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Voice Recorder
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Record consultation audio with pause, resume, and secure upload. No transcription is performed.
        </Typography>
      </Box>

      <Autocomplete
        options={consultations}
        value={selectedConsultation}
        loading={consultationsQuery.isLoading}
        onChange={(_, value) => handleConsultationChange(value)}
        getOptionLabel={(option) => `${option.visitNumber} — ${option.patientName}`}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Consultation"
            placeholder="Select an in-progress consultation"
            helperText="Recordings are linked to the selected consultation."
          />
        )}
      />

      {consultationsQuery.isLoading && (
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={20} />
          <Typography variant="body2">Loading consultations…</Typography>
        </Stack>
      )}

      {!consultationIdParam && (
        <Alert severity="info">Select a consultation to begin recording.</Alert>
      )}

      {consultationIdParam && (
        <VoiceRecordingPanel
          consultationId={consultationIdParam}
          consultationLabel={
            selectedConsultation
              ? `${selectedConsultation.visitNumber} · ${selectedConsultation.patientName}`
              : consultationIdParam
          }
          autoUploadOnStop
          onCompleted={() => {
            navigate("/voice/history");
          }}
        />
      )}
    </Stack>
  );
};

export default VoiceRecorderPage;
