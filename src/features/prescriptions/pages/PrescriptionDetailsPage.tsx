import { useMemo } from "react";
import { Alert, Button, Stack } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import LocalPharmacyRoundedIcon from "@mui/icons-material/LocalPharmacyRounded";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../auth";
import PrescriptionDetailsSkeleton from "../components/PrescriptionDetailsSkeleton";
import PrescriptionForm from "../components/PrescriptionForm";
import PrescriptionSnackbar from "../components/PrescriptionSnackbar";
import PrintPreview from "../components/PrintPreview";
import { useConsultation } from "../../consultations/hooks/useConsultation";
import { useConsumeFlashMessage } from "../hooks/useConsumeFlashMessage";
import { usePrescription } from "../hooks/usePrescription";
import { usePrescriptionSnackbar } from "../hooks/usePrescriptionSnackbar";
import { toFormValues } from "../utils/prescriptionUtils";

const PrescriptionDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canUpdate = Boolean(user?.isSuperuser || user?.permissions.includes("prescriptions:update"));
  const canDispense = Boolean(user?.isSuperuser || user?.permissions.includes("pharmacy:create"));
  const { data: prescription, isLoading, isError, refetch } = usePrescription(id);
  const { data: consultation } = useConsultation(prescription?.consultationId);
  const { snackbar, showSuccess, closeSnackbar } = usePrescriptionSnackbar();

  useConsumeFlashMessage(showSuccess);

  const defaultValues = useMemo(() => (prescription ? toFormValues(prescription) : null), [prescription]);

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
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate("/prescriptions")}>
          Back to Prescriptions
        </Button>
        <Stack direction="row" spacing={1} sx={{ flex: 1, justifyContent: "flex-end" }}>
          {canDispense && (
            <Button
              variant="outlined"
              startIcon={<LocalPharmacyRoundedIcon />}
              onClick={() => navigate(`/pharmacy/dispense/new?prescriptionId=${prescription.id}`)}
            >
              Dispense Medicines
            </Button>
          )}
          {canUpdate && (
            <Button variant="contained" startIcon={<EditRoundedIcon />} onClick={() => navigate(`/prescriptions/${prescription.id}/edit`)}>
              Edit
            </Button>
          )}
        </Stack>
      </Stack>

      <PrescriptionForm
        defaultValues={defaultValues}
        onSubmit={() => undefined}
        readOnly
        showConsultationField={false}
        initialConsultation={consultation ?? null}
      />

      <PrintPreview prescriptionId={prescription.id} />

      <PrescriptionSnackbar state={snackbar} onClose={closeSnackbar} />
    </Stack>
  );
};

export default PrescriptionDetailsPage;
