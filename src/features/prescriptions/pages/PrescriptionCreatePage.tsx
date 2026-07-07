import { useMemo, useState } from "react";
import { Alert, Box, Stack, Typography } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";

import { extractApiErrorMessage } from "../../../lib/extractApiErrorMessage";
import { useConsultation } from "../../consultations/hooks/useConsultation";
import PrescriptionForm from "../components/PrescriptionForm";
import { useCreatePrescription } from "../hooks/useCreatePrescription";
import { prescriptionFormDefaultValues, toCreatePayload } from "../utils/prescriptionUtils";
import type { PrescriptionFormValues } from "../schemas/prescriptionSchema";

const PrescriptionCreatePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const consultationId = searchParams.get("consultationId") ?? "";
  const createPrescription = useCreatePrescription();
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: consultation } = useConsultation(consultationId || undefined);

  const defaultValues = useMemo(
    () => ({
      ...prescriptionFormDefaultValues(consultationId),
      diagnosis: consultation?.diagnosis ?? "",
    }),
    [consultation?.diagnosis, consultationId]
  );

  const handleSubmit = async (values: PrescriptionFormValues) => {
    setServerError(null);
    try {
      const prescription = await createPrescription.mutateAsync(toCreatePayload(values));
      navigate(`/prescriptions/${prescription.id}`, {
        replace: true,
        state: { flashMessage: "Prescription created successfully." },
      });
    } catch (error) {
      setServerError(extractApiErrorMessage(error, "Could not create prescription. Please try again."));
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          New Prescription
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add medicines and dosage instructions for a consultation.
        </Typography>
      </Box>

      {consultationId && !consultation && (
        <Alert severity="warning">Consultation could not be loaded. You can still select one from the list.</Alert>
      )}

      <PrescriptionForm
        key={`${consultationId}-${consultation?.updatedAt ?? "new"}`}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        submitLabel="Create Prescription"
        isSubmitting={createPrescription.isPending}
        serverError={serverError}
        initialConsultation={consultation ?? null}
      />
    </Stack>
  );
};

export default PrescriptionCreatePage;
