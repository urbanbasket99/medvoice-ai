import { useMemo, useState } from "react";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

import { extractApiErrorMessage } from "../../../lib/extractApiErrorMessage";
import { useAuth } from "../../auth";
import { ipdApi } from "../../ipd/api/ipdApi";
import { availableBedsQueryOptions } from "../../ipd/api/ipdQueries";
import ConsultationDetailsSkeleton from "../components/ConsultationDetailsSkeleton";
import ConsultationSnackbar from "../components/ConsultationSnackbar";
import ConsultationWorkspace from "../components/ConsultationWorkspace";
import { useConsumeFlashMessage } from "../hooks/useConsumeFlashMessage";
import { useConsultation } from "../hooks/useConsultation";
import { useConsultationSnackbar } from "../hooks/useConsultationSnackbar";
import { toFormValues } from "../utils/consultationUtils";
import { useQuery } from "@tanstack/react-query";

const ConsultationDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canUpdate = Boolean(user?.isSuperuser || user?.permissions.includes("consultations:update"));
  const canAdmit = Boolean(user?.isSuperuser || user?.permissions.includes("ipd:create"));
  const { data: consultation, isLoading, isError, refetch } = useConsultation(id);
  const { snackbar, showSuccess, closeSnackbar } = useConsultationSnackbar();
  const [admitOpen, setAdmitOpen] = useState(false);
  const [bedId, setBedId] = useState("");
  const [admitError, setAdmitError] = useState<string | null>(null);
  const bedsQuery = useQuery(availableBedsQueryOptions(undefined));

  const admitMutation = useMutation({
    mutationFn: () =>
      ipdApi.createAdmissionFromConsultation({
        consultationId: consultation!.id,
        bedId: bedId || null,
        admissionDate: new Date().toISOString().slice(0, 10),
      }),
    onSuccess: (admission) => {
      setAdmitOpen(false);
      navigate(`/ipd/admissions/${admission.id}`, {
        state: { flashMessage: "Patient admitted from consultation." },
      });
    },
  });

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
          {canAdmit && consultation.status !== "cancelled" && (
            <Button variant="outlined" startIcon={<LocalHospitalRoundedIcon />} onClick={() => setAdmitOpen(true)}>
              Admit to IPD
            </Button>
          )}
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

      <Dialog open={admitOpen} onClose={() => setAdmitOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Admit to IPD</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {admitError && <Alert severity="error">{admitError}</Alert>}
            <TextField
              select
              size="small"
              label="Bed (optional)"
              value={bedId}
              onChange={(e) => setBedId(e.target.value)}
            >
              <MenuItem value="">No bed assigned</MenuItem>
              {(bedsQuery.data ?? []).map((bed) => (
                <MenuItem key={bed.id} value={bed.id}>
                  {bed.wardName ? `${bed.wardName} — ` : ""}
                  {bed.bedNumber}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdmitOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={admitMutation.isPending}
            onClick={() => {
              setAdmitError(null);
              void admitMutation.mutateAsync().catch((error) => {
                setAdmitError(extractApiErrorMessage(error, "Could not admit patient."));
              });
            }}
          >
            Confirm admission
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default ConsultationDetailsPage;
