import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

import { PageHeader } from "../../../components/ui";
import { extractApiErrorMessage } from "../../../lib/extractApiErrorMessage";
import { useAuth } from "../../auth";
import AdmissionClinicalTabs from "../components/AdmissionClinicalTabs";
import { ipdApi } from "../api/ipdApi";
import { admissionDetailQueryOptions, ipdQueryKeys } from "../api/ipdQueries";
import type { AdmissionStatus } from "../types/ipd.types";

const STATUS_LABEL: Record<AdmissionStatus, string> = {
  admitted: "Admitted",
  discharged: "Discharged",
  cancelled: "Cancelled",
};

const STATUS_COLOR: Record<AdmissionStatus, "default" | "success" | "warning"> = {
  admitted: "success",
  discharged: "default",
  cancelled: "warning",
};

const AdmissionDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canUpdate = Boolean(user?.isSuperuser || user?.permissions.includes("ipd:update"));
  const canCreate = Boolean(user?.isSuperuser || user?.permissions.includes("ipd:create"));
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dischargeSummary, setDischargeSummary] = useState("");
  const [dischargeError, setDischargeError] = useState<string | null>(null);

  const detailsQuery = useQuery(admissionDetailQueryOptions(id));

  const dischargeMutation = useMutation({
    mutationFn: () =>
      ipdApi.dischargeAdmission(id as string, {
        dischargeSummary,
      }),
    onSuccess: (updated) => {
      setDialogOpen(false);
      void queryClient.setQueryData(ipdQueryKeys.admissionDetail(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: ipdQueryKeys.admissions() });
      void queryClient.invalidateQueries({ queryKey: ipdQueryKeys.beds() });
      void queryClient.invalidateQueries({ queryKey: ipdQueryKeys.wards() });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => ipdApi.cancelAdmission(id as string),
    onSuccess: (updated) => {
      void queryClient.setQueryData(ipdQueryKeys.admissionDetail(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: ipdQueryKeys.admissions() });
      void queryClient.invalidateQueries({ queryKey: ipdQueryKeys.beds() });
    },
  });

  if (detailsQuery.isLoading) {
    return <Typography variant="body2">Loading admission…</Typography>;
  }

  if (detailsQuery.isError || !detailsQuery.data) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => void detailsQuery.refetch()}>
            Retry
          </Button>
        }
      >
        Admission not found, or the request failed.
      </Alert>
    );
  }

  const admission = detailsQuery.data;

  const handleDischarge = async () => {
    setDischargeError(null);
    try {
      await dischargeMutation.mutateAsync();
    } catch (error) {
      setDischargeError(extractApiErrorMessage(error, "Could not discharge patient."));
    }
  };

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync();
    } catch (error) {
      setDischargeError(extractApiErrorMessage(error, "Could not cancel admission."));
    }
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title={admission.admissionNumber}
        subtitle={`${admission.patientName ?? admission.patientMrn ?? admission.patientId}`}
        backAction={
          <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate("/ipd/admissions")}>
            Back to admissions
          </Button>
        }
        actions={
          canUpdate && admission.status === "admitted" ? (
            <Stack direction="row" spacing={1}>
              <Button color="warning" variant="outlined" onClick={() => void handleCancel()} disabled={cancelMutation.isPending}>
                Cancel admission
              </Button>
              <Button color="warning" variant="contained" onClick={() => setDialogOpen(true)}>
                Discharge patient
              </Button>
            </Stack>
          ) : undefined
        }
      />

      <Chip label={STATUS_LABEL[admission.status]} color={STATUS_COLOR[admission.status]} size="small" sx={{ alignSelf: "flex-start" }} />

      <Card variant="outlined">
        <CardHeader title="Admission details" />
        <Divider />
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="body2">
              <strong>Patient:</strong> {admission.patientName ?? "—"} ({admission.patientMrn ?? "—"})
            </Typography>
            <Typography variant="body2">
              <strong>Admitting doctor:</strong> {admission.doctorName ?? admission.doctorCode ?? "—"}
            </Typography>
            <Typography variant="body2">
              <strong>Admission type:</strong> {admission.admissionType}
            </Typography>
            <Typography variant="body2">
              <strong>Ward / bed:</strong> {admission.wardName ?? "—"} / {admission.bedNumber ?? "—"}
            </Typography>
            <Typography variant="body2">
              <strong>Admitted on:</strong> {admission.admissionDate.slice(0, 10)}
            </Typography>
            <Typography variant="body2">
              <strong>Expected discharge:</strong> {admission.expectedDischargeDate?.slice(0, 10) ?? "—"}
            </Typography>
            <Typography variant="body2">
              <strong>Discharged at:</strong> {admission.dischargedAt?.slice(0, 10) ?? "—"}
            </Typography>
            <Typography variant="body2">
              <strong>Chief complaint:</strong> {admission.chiefComplaint ?? "—"}
            </Typography>
            <Typography variant="body2">
              <strong>Diagnosis:</strong> {admission.diagnosis ?? "—"}
            </Typography>
            <Typography variant="body2">
              <strong>Notes:</strong> {admission.notes ?? "—"}
            </Typography>
            {admission.dischargeSummary && (
              <Typography variant="body2">
                <strong>Discharge summary:</strong> {admission.dischargeSummary}
              </Typography>
            )}
            {admission.dischargedByName && (
              <Typography variant="body2">
                <strong>Discharged by:</strong> {admission.dischargedByName}
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>

      <AdmissionClinicalTabs admissionId={admission.id} canCreate={canCreate} canUpdate={canUpdate} />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Discharge patient</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {dischargeError && <Alert severity="error">{dischargeError}</Alert>}
            <TextField
              label="Discharge summary"
              size="small"
              fullWidth
              multiline
              minRows={4}
              value={dischargeSummary}
              onChange={(event) => setDischargeSummary(event.target.value)}
              placeholder="Clinical summary, follow-up instructions, medications…"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => void handleDischarge()}
            disabled={dischargeMutation.isPending}
          >
            Confirm discharge
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default AdmissionDetailsPage;
