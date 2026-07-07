import { useMemo, useState } from "react";
import { Alert, Box, Stack, Typography } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";

import { extractApiErrorMessage } from "../../../lib/extractApiErrorMessage";
import { useConsultation } from "../../consultations/hooks/useConsultation";
import RadiologyOrderForm from "../components/RadiologyOrderForm";
import { useCreateRadiologyOrder } from "../hooks/useCreateRadiologyOrder";
import { radiologyOrderFormDefaultValues, toCreatePayload } from "../utils/radiologyUtils";
import type { RadiologyOrderFormValues } from "../schemas/radiologySchema";

const RadiologyOrderCreatePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const consultationId = searchParams.get("consultationId") ?? "";
  const createRadiologyOrder = useCreateRadiologyOrder();
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: consultation } = useConsultation(consultationId || undefined);

  const defaultValues = useMemo(() => radiologyOrderFormDefaultValues(consultationId), [consultationId]);

  const handleSubmit = async (values: RadiologyOrderFormValues) => {
    setServerError(null);
    try {
      const radiologyOrder = await createRadiologyOrder.mutateAsync(toCreatePayload(values));
      navigate(`/radiology/orders/${radiologyOrder.id}`, {
        replace: true,
        state: { flashMessage: "Radiology order created successfully." },
      });
    } catch (error) {
      setServerError(extractApiErrorMessage(error, "Could not create radiology order. Please try again."));
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          New Radiology Order
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select imaging studies and priority for a consultation request.
        </Typography>
      </Box>

      {consultationId && !consultation && (
        <Alert severity="warning">Consultation could not be loaded. You can still select one from the list.</Alert>
      )}

      <RadiologyOrderForm
        key={`${consultationId}-${consultation?.updatedAt ?? "new"}`}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        submitLabel="Create Radiology Order"
        isSubmitting={createRadiologyOrder.isPending}
        serverError={serverError}
        initialConsultation={consultation ?? null}
      />
    </Stack>
  );
};

export default RadiologyOrderCreatePage;
