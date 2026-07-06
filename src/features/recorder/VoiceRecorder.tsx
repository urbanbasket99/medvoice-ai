import { useEffect, useState } from "react";
import MedicalNotesCard from "../medicalNotes/MedicalNotesCard";
import type { MedicalNotes } from "../../types/MedicalNotes";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Typography,
  
} from "@mui/material";


import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";

import { useRecorder } from "../../hooks/useRecorder";
import { transcribeAudio } from "../../services/transcriptionService";

const VoiceRecorder = () => {
  const {
    startRecording,
    stopRecording,
    isRecording,
    audioURL,
    audioBlob,
  } = useRecorder();

  const [loading, setLoading] = useState(false);
 const [transcript, setTranscript] = useState("");

const [medicalNotes, setMedicalNotes] = useState<MedicalNotes>({
  chiefComplaint: "",
  history: "",
  diagnosis: "",
  prescription: "",
  advice: "",
});
  useEffect(() => {
    if (!audioBlob) return;

    const upload = async () => {
      try {
        setLoading(true);

        const result = await transcribeAudio(audioBlob);

        setTranscript(result.transcript);

setMedicalNotes(result.medicalNotes);
      } catch (err) {
        console.error(err);
        alert("Unable to transcribe audio.");
      } finally {
        setLoading(false);
      }
    };

    upload();
  }, [audioBlob]);

  return (
    <Box
      sx={{
        maxWidth: 900,
        mx: "auto",
        mt: 5,
      }}
    >
      <Card elevation={5}>
        <CardContent>

          <Typography
            variant="h4"
            fontWeight="bold"
            gutterBottom
          >
            🎤 MedVoice AI
          </Typography>

          <Typography
            color="text.secondary"
            mb={3}
          >
            Speak naturally. AI will generate the transcript.
          </Typography>

          {!isRecording ? (
            <Button
              variant="contained"
              size="large"
              startIcon={<MicIcon />}
              onClick={startRecording}
            >
              Start Recording
            </Button>
          ) : (
            <Button
              variant="contained"
              color="error"
              size="large"
              startIcon={<StopIcon />}
              onClick={stopRecording}
            >
              Stop Recording
            </Button>
          )}

          <Chip
            sx={{ ml: 3 }}
            color={isRecording ? "error" : "success"}
            label={isRecording ? "Recording..." : "Ready"}
          />

          {audioURL && (
            <Box mt={4}>
              <Typography variant="h6">
                Recorded Audio
              </Typography>

              <audio
                controls
                src={audioURL}
                style={{
                  width: "100%",
                  marginTop: 10,
                }}
              />
            </Box>
          )}

          {loading && (
            <Box
              mt={4}
              display="flex"
              alignItems="center"
              gap={2}
            >
              <CircularProgress size={25} />
              <Typography>
                AI is converting speech to text...
              </Typography>
            </Box>
          )}

          {transcript && (
            <Card
              sx={{
                mt: 4,
                bgcolor: "#f5f5f5",
              }}
            >
            
              <CardContent>

                <Typography
                  variant="h6"
                  gutterBottom
                >
                  Transcript
                </Typography>

                <Typography>
                  {transcript}
                </Typography>

              </CardContent>
            </Card>
          )}
{transcript && (
  <MedicalNotesCard medicalNotes={medicalNotes} />
)}
        </CardContent>
      </Card>
    </Box>
  );
};

export default VoiceRecorder;