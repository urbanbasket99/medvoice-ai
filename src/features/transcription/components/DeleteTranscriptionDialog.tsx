import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

import type { Transcription } from "../types/transcription.types";

const DeleteTranscriptionDialog = ({
  transcription,
  isDeleting,
  onConfirm,
  onClose,
}: {
  transcription: Transcription | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) => (
  <Dialog open={Boolean(transcription)} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>Delete Transcription</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Delete the transcript for consultation{" "}
        <strong>{transcription?.consultationVisitNumber ?? transcription?.consultationId}</strong>
        {transcription?.patientName ? (
          <>
            {" "}
            (<strong>{transcription.patientName}</strong>)
          </>
        ) : null}
        ?
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

export default DeleteTranscriptionDialog;
