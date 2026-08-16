import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { useNavigate, useParams } from "react-router-dom";

import { extractApiErrorMessage } from "../../../lib/extractApiErrorMessage";
import { useAuth } from "../../auth";
import { useConsultation } from "../../consultations/hooks/useConsultation";
import DispenseDeleteDialog from "../components/PharmacyDeleteDialog";
import DispenseDetailsSkeleton from "../components/DispenseDetailsSkeleton";
import DispenseForm from "../components/DispenseForm";
import DispensePrint from "../components/DispensePrint";
import PharmacySnackbar from "../components/PharmacySnackbar";
import StatusTimeline from "../components/StatusTimeline";
import { useConsumeFlashMessage } from "../hooks/useConsumeFlashMessage";
import { useDeleteDispense, useUpdateDispenseStatus } from "../hooks/useDispenseMutations";
import { useDispense } from "../hooks/useDispenses";
import { usePharmacySnackbar } from "../hooks/usePharmacySnackbar";
import { DISPENSE_STATUS_OPTIONS } from "../schemas/pharmacySchema";
import type { DispenseStatus } from "../types/pharmacy.types";
import {
  getStatusChipColor,
  isTerminalStatus,
  STATUS_LABELS,
  toDispenseFormValues,
  toStatusUpdatePayload,
} from "../utils/pharmacyUtils";

const DispenseDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canUpdate = Boolean(user?.isSuperuser || user?.permissions.includes("pharmacy:update"));
  const canDelete = Boolean(user?.isSuperuser || user?.permissions.includes("pharmacy:delete"));

  const { data: dispense, isLoading, isError, refetch } = useDispense(id);
  const { data: consultation } = useConsultation(dispense?.consultationId ?? undefined)
  const updateStatus = useUpdateDispenseStatus();
  const deleteDispense = useDeleteDispense();
  const { snackbar, showSuccess, showError, closeSnackbar } = usePharmacySnackbar();

  const [pendingDelete, setPendingDelete] = useState(false);
  const [statusSelection, setStatusSelection] = useState<DispenseStatus | null>(null);
  const [statusNotes, setStatusNotes] = useState("");
  const [statusError, setStatusError] = useState<string | null>(null);

  useConsumeFlashMessage(showSuccess);

  const defaultValues = useMemo(() => (dispense ? toDispenseFormValues(dispense) : null), [dispense]);

  const availableStatuses = useMemo(
    () => (dispense ? DISPENSE_STATUS_OPTIONS.filter((status) => status !== dispense.status) : []),
    [dispense]
  );

  const nextStatus = statusSelection ?? availableStatuses[0] ?? null;

  useEffect(() => {
    setStatusSelection(null);
  }, [dispense?.id, dispense?.status]);

  if (isLoading) {
    return <DispenseDetailsSkeleton />;
  }

  if (isError || !dispense || !defaultValues) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => void refetch()}>
            Retry
          </Button>
        }
      >
        Dispense record not found, or the request failed. Please try again.
      </Alert>
    );
  }

  const handleStatusUpdate = async () => {
    if (!id || !nextStatus) return;
    setStatusError(null);
    try {
      await updateStatus.mutateAsync({
        id,
        payload: toStatusUpdatePayload(nextStatus, statusNotes),
      });
      setStatusNotes("");
      showSuccess(`Status updated to ${STATUS_LABELS[nextStatus]}.`);
    } catch (error) {
      setStatusError(extractApiErrorMessage(error, "Could not update status. Please try again."));
    }
  };

  const handleConfirmDelete = async () => {
    if (!id) return;
    try {
      await deleteDispense.mutateAsync(id);
      navigate("/pharmacy/dispense", {
        replace: true,
        state: { flashMessage: `Dispense ${dispense.orderNumber} was deleted.` },
      });
    } catch {
      showError("Could not delete dispense record. Please try again.");
      setPendingDelete(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate("/pharmacy/dispense")}>
          Back to Dispenses
        </Button>
        <Stack direction="row" spacing={1} sx={{ flex: 1, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <Chip label={STATUS_LABELS[dispense.status]} color={getStatusChipColor(dispense.status)} />
          {canDelete && !isTerminalStatus(dispense.status) && (
            <Button color="error" startIcon={<DeleteOutlineRoundedIcon />} onClick={() => setPendingDelete(true)}>
              Delete
            </Button>
          )}
        </Stack>
      </Stack>

      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Dispense {dispense.orderNumber}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {dispense.patientName ?? "Patient"} • Visit {dispense.consultationVisitNumber ?? "—"}
        </Typography>
      </Box>

      <DispenseForm
        defaultValues={defaultValues}
        onSubmit={() => undefined}
        readOnly
        showConsultationField={false}
        initialConsultation={consultation ?? null}
      />

      <Card variant="outlined">
        <CardHeader title="Status History" />
        <Divider />
        <CardContent>
          <StatusTimeline statusHistory={dispense.statusHistory} />
        </CardContent>
      </Card>

      {canUpdate && !isTerminalStatus(dispense.status) && (
        <Card variant="outlined">
          <CardHeader title="Update Status" />
          <Divider />
          <CardContent>
            <Stack spacing={2}>
              {statusError && <Alert severity="error">{statusError}</Alert>}
              <TextField
                select
                label="New Status"
                value={nextStatus ?? ""}
                onChange={(event) => setStatusSelection(event.target.value as DispenseStatus)}
                fullWidth
                size="small"
              >
                {availableStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Notes (optional)"
                value={statusNotes}
                onChange={(event) => setStatusNotes(event.target.value)}
                fullWidth
                multiline
                minRows={2}
                size="small"
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  disabled={updateStatus.isPending || !nextStatus || availableStatuses.length === 0}
                  startIcon={updateStatus.isPending ? <CircularProgress size={18} color="inherit" /> : undefined}
                  onClick={() => void handleStatusUpdate()}
                >
                  Update Status
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      <DispensePrint dispenseId={dispense.id} />

      <DispenseDeleteDialog
        dispense={pendingDelete ? dispense : null}
        isDeleting={deleteDispense.isPending}
        onConfirm={() => void handleConfirmDelete()}
        onClose={() => setPendingDelete(false)}
      />
      <PharmacySnackbar state={snackbar} onClose={closeSnackbar} />
    </Stack>
  );
};

export default DispenseDetailsPage;
