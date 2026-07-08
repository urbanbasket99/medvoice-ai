import ConfirmDialog from "../../../components/ui/ConfirmDialog";
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
  <ConfirmDialog
    open={Boolean(recording)}
    title="Delete Recording?"
    message={
      <>
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
      </>
    }
    confirmLabel="Delete"
    confirmingLabel="Deleting…"
    isPending={isDeleting}
    onConfirm={onConfirm}
    onClose={onClose}
  />
);

export default DeleteRecordingDialog;
