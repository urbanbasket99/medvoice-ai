import { useMemo, useState } from "react";
import { Alert, Button, Stack } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { useNavigate, useParams } from "react-router-dom";
import type { AxiosError } from "axios";

import ConsultationDetailsSkeleton from "../components/ConsultationDetailsSkeleton";
import ConsultationSnackbar from "../components/ConsultationSnackbar";
import ConsultationWorkspace from "../components/ConsultationWorkspace";
import { ConsultationVoiceRecorder } from "../../voice";
import { ConsultationTranscriptionPanel } from "../../transcription";
import { ConsultationPrescriptionPanel } from "../../prescriptions";
import { ConsultationLaboratoryPanel } from "../../laboratory";
import { ConsultationRadiologyPanel } from "../../radiology";
import { ConsultationBillingPanel } from "../../billing";
import type { ConsultationFormValues } from "../schemas/consultationSchema";
import { useConsumeFlashMessage } from "../hooks/useConsumeFlashMessage";
import { useConsultation } from "../hooks/useConsultation";
import { useConsultationSnackbar } from "../hooks/useConsultationSnackbar";
import { useUpdateConsultation } from "../hooks/useUpdateConsultation";
import { toFormValues, toUpdatePayload } from "../utils/consultationUtils";

const extractErrorMessage = (error: unknown): string => {
  const detail = (error as AxiosError<{ detail?: string }>)?.response?.data?.detail;
  return detail ?? "Could not save the consultation. Please try again.";
};

const ConsultationEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: consultation, isLoading, isError, refetch } = useConsultation(id);
  const updateConsultation = useUpdateConsultation();
  const { snackbar, showSuccess, showError, closeSnackbar } = useConsultationSnackbar();
  const [serverError, setServerError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useConsumeFlashMessage(showSuccess);

  const defaultValues = useMemo(() => (consultation ? toFormValues(consultation) : null), [consultation]);

  const handleSubmit = async (values: ConsultationFormValues) => {
    if (!id) return;
    setServerError(null);
    setValidationError(null);
    try {
      const updated = await updateConsultation.mutateAsync({ id, payload: toUpdatePayload(values) });
      showSuccess(`Consultation ${updated.visitNumber} saved successfully.`);
    } catch (error) {
      setServerError(extractErrorMessage(error));
      showError(extractErrorMessage(error));
    }
  };

  if (isLoading) {
    return <ConsultationDetailsSkeleton />;
  }

  if (isError || !consultation || !defaultValues) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => void refetch()}>
            Retry
          </Button>
        }
      >
        Consultation not found, or the request failed. Please try again.
      </Alert>
    );
  }

  if (consultation.status === "cancelled" || consultation.status === "completed") {
    return (
      <Alert severity="info">
        This consultation is {consultation.status.replace("_", " ")} and can no longer be edited.{" "}
        <Button size="small" onClick={() => navigate(`/consultations/${consultation.id}`)}>
          View details
        </Button>
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate("/consultations")}>
          Back to Consultations
        </Button>
      </Stack>

      {validationError && <Alert severity="warning">{validationError}</Alert>}
      {serverError && <Alert severity="error">{serverError}</Alert>}

      <ConsultationVoiceRecorder consultation={consultation} />

      <ConsultationTranscriptionPanel consultation={consultation} />

      <ConsultationPrescriptionPanel consultation={consultation} />

      <ConsultationLaboratoryPanel consultation={consultation} />

      <ConsultationRadiologyPanel consultation={consultation} />

      <ConsultationBillingPanel consultation={consultation} />

      <ConsultationWorkspace
        key={consultation.updatedAt}
        consultation={consultation}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        onValidationError={(message) => {
          setValidationError(message);
          setServerError(null);
        }}
        isSaving={updateConsultation.isPending}
      />

      <ConsultationSnackbar state={snackbar} onClose={closeSnackbar} />
    </Stack>
  );
};

export default ConsultationEditorPage;
