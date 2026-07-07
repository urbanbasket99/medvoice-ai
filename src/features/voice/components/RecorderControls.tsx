import { Button, Stack } from "@mui/material";
import FiberManualRecordRoundedIcon from "@mui/icons-material/FiberManualRecordRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

import type { RecorderPhase } from "../types/voice.types";

const RecorderControls = ({
  phase,
  canRecord,
  isBusy,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset,
  onUpload,
}: {
  phase: RecorderPhase;
  canRecord: boolean;
  isBusy?: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset: () => void;
  onUpload?: () => void;
}) => {
  const disabled = Boolean(isBusy);

  if (phase === "idle" || phase === "error") {
    return (
      <Stack direction="row" spacing={1.5} justifyContent="center" flexWrap="wrap">
        <Button
          variant="contained"
          size="large"
          color="error"
          startIcon={<FiberManualRecordRoundedIcon />}
          onClick={onStart}
          disabled={!canRecord || disabled}
        >
          Start Recording
        </Button>
        {phase === "error" && (
          <Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={onReset} disabled={disabled}>
            Reset
          </Button>
        )}
      </Stack>
    );
  }

  if (phase === "recording") {
    return (
      <Stack direction="row" spacing={1.5} justifyContent="center" flexWrap="wrap">
        <Button variant="outlined" size="large" startIcon={<PauseRoundedIcon />} onClick={onPause} disabled={disabled}>
          Pause
        </Button>
        <Button variant="contained" size="large" color="error" startIcon={<StopRoundedIcon />} onClick={onStop} disabled={disabled}>
          Stop
        </Button>
      </Stack>
    );
  }

  if (phase === "paused") {
    return (
      <Stack direction="row" spacing={1.5} justifyContent="center" flexWrap="wrap">
        <Button variant="contained" size="large" startIcon={<PlayArrowRoundedIcon />} onClick={onResume} disabled={disabled}>
          Resume
        </Button>
        <Button variant="outlined" size="large" color="error" startIcon={<StopRoundedIcon />} onClick={onStop} disabled={disabled}>
          Stop
        </Button>
      </Stack>
    );
  }

  if (phase === "stopped") {
    return (
      <Stack direction="row" spacing={1.5} justifyContent="center" flexWrap="wrap">
        {onUpload && (
          <Button variant="contained" size="large" startIcon={<CloudUploadRoundedIcon />} onClick={onUpload} disabled={disabled}>
            Upload Recording
          </Button>
        )}
        <Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={onReset} disabled={disabled}>
          Discard
        </Button>
      </Stack>
    );
  }

  if (phase === "completed") {
    return (
      <Stack direction="row" spacing={1.5} justifyContent="center">
        <Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={onReset}>
          Record Again
        </Button>
      </Stack>
    );
  }

  return null;
};

export default RecorderControls;
