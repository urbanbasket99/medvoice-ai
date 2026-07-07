import { useMemo } from "react";
import { Alert, Button, Stack } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../auth";
import ConsultationDetailsSkeleton from "../components/ConsultationDetailsSkeleton";
import ConsultationSnackbar from "../components/ConsultationSnackbar";
import ConsultationWorkspace from "../components/ConsultationWorkspace";
import { useConsumeFlashMessage } from "../hooks/useConsumeFlashMessage";
import { useConsultation } from "../hooks/useConsultation";
import { useConsultationSnackbar } from "../hooks/useConsultationSnackbar";
import { toFormValues } from "../utils/consultationUtils";

const ConsultationDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canUpdate = Boolean(user?.isSuperuser || user?.permissions.includes("consultations:update"));
  const { data: consultation, isLoading, isError, refetch } = useConsultation(id);
  const { snackbar, showSuccess, closeSnackbar } = useConsultationSnackbar();

  useConsumeFlashMessage(showSuccess);

  const defaultValues = useMemo(() => (consultation ? toFormValues(consultation) : null), [consultation]);
  const canEdit = canUpdate && consultation && consultation.status !== "cancelled" && consultation.status !== "completed";

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

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate("/consultations")}>
          Back to Consultations
        </Button>
        <Stack direction="row" spacing={1} sx={{ flex: 1, justifyContent: "flex-end" }}>
          {canEdit && (
            <Button variant="contained" startIcon={<EditRoundedIcon />} onClick={() => navigate(`/consultations/${consultation.id}/edit`)}>
              Open Editor
            </Button>
          )}
        </Stack>
      </Stack>

      <ConsultationWorkspace
        consultation={consultation}
        defaultValues={defaultValues}
        onSubmit={() => undefined}
        readOnly
        showSaveBar={false}
        showStatusField={false}
      />

      <ConsultationSnackbar state={snackbar} onClose={closeSnackbar} />
    </Stack>
  );
};

export default ConsultationDetailsPage;
