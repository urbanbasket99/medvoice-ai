import { useMemo, useState } from "react";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

import { extractApiErrorMessage } from "../../../lib/extractApiErrorMessage";
import PrescriptionDetailsSkeleton from "../components/PrescriptionDetailsSkeleton";
import PrescriptionForm from "../components/PrescriptionForm";
import { useConsultation } from "../../consultations/hooks/useConsultation";
import { usePrescription } from "../hooks/usePrescription";
import { useUpdatePrescription } from "../hooks/useUpdatePrescription";
import { toFormValues, toUpdatePayload } from "../utils/prescriptionUtils";
import type { PrescriptionFormValues } from "../schemas/prescriptionSchema";

const PrescriptionEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: prescription, isLoading, isError, refetch } = usePrescription(id);
  const { data: consultation } = useConsultation(prescription?.consultationId);
  const updatePrescription = useUpdatePrescription();
  const [serverError, setServerError] = useState<string | null>(null);

  const defaultValues = useMemo(() => (prescription ? toFormValues(prescription) : null), [prescription]);

  const handleSubmit = async (values: PrescriptionFormValues) => {
    if (!id) return;
    setServerError(null);
    try {
      await updatePrescription.mutateAsync({ id, payload: toUpdatePayload(values) });
      navigate(`/prescriptions/${id}`, {
        replace: true,
        state: { flashMessage: "Prescription updated successfully." },
      });
    } catch (error) {
      setServerError(extractApiErrorMessage(error, "Could not update prescription. Please try again."));
    }
  };

  if (isLoading) {
    return <PrescriptionDetailsSkeleton />;
  }

  if (isError || !prescription || !defaultValues) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => void refetch()}>
            Retry
          </Button>
        }
      >
        Prescription not found, or the request failed. Please try again.
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Edit Prescription
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {prescription.patientName ?? "Patient"} • Visit {prescription.consultationVisitNumber ?? "—"}
        </Typography>
      </Box>

      <PrescriptionForm
        key={prescription.updatedAt}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
        isSubmitting={updatePrescription.isPending}
        serverError={serverError}
        showConsultationField={false}
        initialConsultation={consultation ?? null}
      />
    </Stack>
  );
};

export default PrescriptionEditPage;
