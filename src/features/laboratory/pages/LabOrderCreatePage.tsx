import { useMemo, useState } from "react";
import { Alert, Box, Stack, Typography } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";

import { extractApiErrorMessage } from "../../../lib/extractApiErrorMessage";
import { useConsultation } from "../../consultations/hooks/useConsultation";
import LabOrderForm from "../components/LabOrderForm";
import { useCreateLabOrder } from "../hooks/useCreateLabOrder";
import { labOrderFormDefaultValues, toCreatePayload } from "../utils/laboratoryUtils";
import type { LabOrderFormValues } from "../schemas/laboratorySchema";

const LabOrderCreatePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const consultationId = searchParams.get("consultationId") ?? "";
  const createLabOrder = useCreateLabOrder();
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: consultation } = useConsultation(consultationId || undefined);

  const defaultValues = useMemo(() => labOrderFormDefaultValues(consultationId), [consultationId]);

  const handleSubmit = async (values: LabOrderFormValues) => {
    setServerError(null);
    try {
      const labOrder = await createLabOrder.mutateAsync(toCreatePayload(values));
      navigate(`/laboratory/orders/${labOrder.id}`, {
        replace: true,
        state: { flashMessage: "Lab order created successfully." },
      });
    } catch (error) {
      setServerError(extractApiErrorMessage(error, "Could not create lab order. Please try again."));
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          New Lab Order
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select tests and priority for a consultation requisition.
        </Typography>
      </Box>

      {consultationId && !consultation && (
        <Alert severity="warning">Consultation could not be loaded. You can still select one from the list.</Alert>
      )}

      <LabOrderForm
        key={`${consultationId}-${consultation?.updatedAt ?? "new"}`}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        submitLabel="Create Lab Order"
        isSubmitting={createLabOrder.isPending}
        serverError={serverError}
        initialConsultation={consultation ?? null}
      />
    </Stack>
  );
};

export default LabOrderCreatePage;
