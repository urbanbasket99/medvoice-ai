import Prescription from "../Prescription/Prescription";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

import { ReactMediaRecorder } from "react-media-recorder";

const VoiceRecorder = () => {
  return (
    <ReactMediaRecorder
      audio
      render={({
        status,
        startRecording,
        stopRecording,
        mediaBlobUrl,
      }) => (
        <Card
          elevation={4}
          sx={{
            maxWidth: 900,
            margin: "40px auto",
            borderRadius: 4,
          }}
        >
          <CardContent>

            <Typography
              variant="h4"
              fontWeight="bold"
              gutterBottom
            >
              🎤 AI Voice Recorder
            </Typography>

            <Typography
              color="text.secondary"
              mb={3}
            >
              Record doctor's voice.
            </Typography>

            <Chip
              label={status.toUpperCase()}
              color={
                status === "recording"
                  ? "error"
                  : "primary"
              }
            />

            <Stack
              direction="row"
              spacing={2}
              mt={4}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<MicIcon />}
                onClick={startRecording}
              >
                Start Recording
              </Button>

              <Button
                variant="contained"
                color="error"
                size="large"
                startIcon={<StopIcon />}
                onClick={stopRecording}
              >
                Stop Recording
              </Button>
            </Stack>

            {mediaBlobUrl && (
              <Box mt={5}>

                <Typography
                  variant="h6"
                  gutterBottom
                >
                  Recorded Audio
                </Typography>

                <audio
                  controls
                  src={mediaBlobUrl}
                  style={{
                    width: "100%",
                  }}
                />

                <Button
                  sx={{ mt: 3 }}
                  startIcon={<PlayArrowIcon />}
                  href={mediaBlobUrl}
                  download="doctor-recording.webm"
                  variant="outlined"
                >
                  Download Recording
                </Button>
{mediaBlobUrl && <Prescription />}
              </Box>
            )}

          </CardContent>
        </Card>
      )}
    />
  );
};

export default VoiceRecorder;