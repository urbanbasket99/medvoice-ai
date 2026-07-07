import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

import type { VoiceRecording } from "../types/voice.types";
import { formatRecordingDuration } from "../utils/voiceUtils";

const DeleteRecordingDialog = ({
  recording,
  isDeleting,
  onConfirm,
  onClose,
}: {
  recording: VoiceRecording | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) => (
  <Dialog open={Boolean(recording)} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>Delete Recording</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Permanently delete the recording for consultation{" "}
        <strong>{recording?.consultationVisitNumber ?? recording?.consultationId}</strong>
        {recording?.patientName ? (
          <>
            {" "}
            (<strong>{recording.patientName}</strong>)
          </>
        ) : null}
        ? This action cannot be undone.
        {recording?.durationSeconds != null && (
          <>
            <br />
            Duration: {formatRecordingDuration(recording.durationSeconds)}
          </>
        )}
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} disabled={isDeleting}>
        Cancel
      </Button>
      <Button color="error" variant="contained" onClick={onConfirm} disabled={isDeleting}>
        {isDeleting ? "Deleting…" : "Delete"}
      </Button>
    </DialogActions>
  </Dialog>
);

export default DeleteRecordingDialog;
