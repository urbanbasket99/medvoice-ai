import { Button, Stack } from "@mui/material";
import MicRoundedIcon from "@mui/icons-material/MicRounded";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../auth";
import VoiceRecordingPanel from "./VoiceRecordingPanel";
import type { Consultation } from "../../consultations/types/consultation.types";

const ConsultationVoiceRecorder = ({ consultation }: { consultation: Consultation }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canRecord = Boolean(user?.isSuperuser || user?.permissions.includes("voice:record"));

  if (!canRecord) return null;

  const label = `${consultation.visitNumber} · ${consultation.patientName}`;

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button
          size="small"
          variant="text"
          startIcon={<MicRoundedIcon />}
          onClick={() => navigate(`/voice/record?consultationId=${consultation.id}`)}
        >
          Open full recorder
        </Button>
      </Stack>
      <VoiceRecordingPanel consultationId={consultation.id} consultationLabel={label} compact />
    </Stack>
  );
};

export default ConsultationVoiceRecorder;
