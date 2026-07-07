import { useMemo, useState } from "react";
import { Alert, Box, Stack, Typography } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";

import { extractApiErrorMessage } from "../../../lib/extractApiErrorMessage";
import { useConsultation } from "../../consultations/hooks/useConsultation";
import { usePrescription } from "../../prescriptions/hooks/usePrescription";
import DispenseForm from "../components/DispenseForm";
import { useCreateDispense } from "../hooks/useDispenseMutations";
import type { DispenseFormValues } from "../schemas/pharmacySchema";
import { dispenseFormDefaultValues, toCreateDispensePayload, toDispenseFormValuesFromPrescription } from "../utils/pharmacyUtils";

const DispensePrescriptionPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prescriptionId = searchParams.get("prescriptionId") ?? "";
  const createDispense = useCreateDispense();
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: prescription, isLoading: prescriptionLoading, isError: prescriptionError } = usePrescription(
    prescriptionId || undefined
  );
  const { data: consultation } = useConsultation(prescription?.consultationId);

  const defaultValues = useMemo((): DispenseFormValues => {
    if (prescription) {
      return toDispenseFormValuesFromPrescription(prescription);
    }
    return dispenseFormDefaultValues("", prescriptionId);
  }, [prescription, prescriptionId]);

  const handleSubmit = async (values: DispenseFormValues) => {
    setServerError(null);
    try {
      const dispense = await createDispense.mutateAsync(toCreateDispensePayload(values));
      navigate(`/pharmacy/dispense/${dispense.id}`, {
        replace: true,
        state: { flashMessage: "Dispense record created successfully." },
      });
    } catch (error) {
      setServerError(extractApiErrorMessage(error, "Could not create dispense record. Please try again."));
    }
  };

  if (prescriptionId && prescriptionLoading) {
    return (
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          Loading prescription…
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Dispense Medicines
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {prescriptionId
            ? "Create a pharmacy dispense from the linked prescription."
            : "Select a consultation with an active prescription to create a dispense record."}
        </Typography>
      </Box>

      {prescriptionId && prescriptionError && (
        <Alert severity="warning">
          Prescription could not be loaded. You can still create a dispense manually.
        </Alert>
      )}

      <DispenseForm
        key={`${prescriptionId}-${prescription?.updatedAt ?? "new"}`}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        submitLabel="Create Dispense"
        isSubmitting={createDispense.isPending}
        serverError={serverError}
        showConsultationField={!prescription}
        initialConsultation={consultation ?? null}
      />
    </Stack>
  );
};

export default DispensePrescriptionPage;
