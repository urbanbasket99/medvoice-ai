import AppSnackbar from "../../../components/ui/AppSnackbar";
import type { PatientSnackbarState } from "../hooks/usePatientSnackbar";

export interface PatientSnackbarProps {
  state: PatientSnackbarState;
  onClose: () => void;
}

const PatientSnackbar = ({ state, onClose }: PatientSnackbarProps) => (
  <AppSnackbar state={state} onClose={onClose} />
);

export default PatientSnackbar;
