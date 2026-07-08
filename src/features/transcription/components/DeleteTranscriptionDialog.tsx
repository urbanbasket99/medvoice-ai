import ConfirmDialog from "../../../components/ui/ConfirmDialog";
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
  <ConfirmDialog
    open={Boolean(transcription)}
    title="Delete Transcription?"
    message={
      <>
        Delete the transcript for consultation{" "}
        <strong>{transcription?.consultationVisitNumber ?? transcription?.consultationId}</strong>
        {transcription?.patientName ? (
          <>
            {" "}
            (<strong>{transcription.patientName}</strong>)
          </>
        ) : null}
        ?
      </>
    }
    confirmLabel="Delete"
    confirmingLabel="Deleting…"
    isPending={isDeleting}
    onConfirm={onConfirm}
    onClose={onClose}
  />
);

export default DeleteTranscriptionDialog;
