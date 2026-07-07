import { Dialog, DialogContent, DialogTitle } from "@mui/material";

import DispenseForm from "./DispenseForm";
import type { DispenseFormValues } from "../schemas/pharmacySchema";
import type { Consultation } from "../../consultations/types/consultation.types";

export interface DispenseDialogProps {
  open: boolean;
  defaultValues: DispenseFormValues;
  onSubmit: (values: DispenseFormValues) => Promise<void> | void;
  onClose: () => void;
  isSubmitting?: boolean;
  serverError?: string | null;
  initialConsultation?: Consultation | null;
}

const DispenseDialog = ({
  open,
  defaultValues,
  onSubmit,
  onClose,
  isSubmitting,
  serverError,
  initialConsultation,
}: DispenseDialogProps) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle>New Dispense</DialogTitle>
    <DialogContent>
      <DispenseForm
        defaultValues={defaultValues}
        onSubmit={async (values) => {
          await onSubmit(values);
        }}
        submitLabel="Create Dispense"
        isSubmitting={isSubmitting}
        serverError={serverError}
        initialConsultation={initialConsultation ?? null}
        showConsultationField={!initialConsultation}
      />
    </DialogContent>
  </Dialog>
);

export default DispenseDialog;
