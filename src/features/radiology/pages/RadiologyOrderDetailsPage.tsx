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
import RadiologyOrderDeleteDialog from "../components/RadiologyOrderDeleteDialog";
import RadiologyOrderDetailsSkeleton from "../components/RadiologyOrderDetailsSkeleton";
import RadiologyOrderForm from "../components/RadiologyOrderForm";
import RadiologyOrderSnackbar from "../components/RadiologyOrderSnackbar";
import ImagingRequestPrint from "../components/ImagingRequestPrint";
import StatusTimeline from "../components/StatusTimeline";
import { useConsumeFlashMessage } from "../hooks/useConsumeFlashMessage";
import { useDeleteRadiologyOrder } from "../hooks/useDeleteRadiologyOrder";
import { useRadiologyOrder } from "../hooks/useRadiologyOrder";
import { useRadiologyOrderSnackbar } from "../hooks/useRadiologyOrderSnackbar";
import { useUpdateRadiologyOrderStatus } from "../hooks/useUpdateRadiologyOrderStatus";
import { STATUS_OPTIONS } from "../schemas/radiologySchema";
import type { RadiologyStatus } from "../types/radiology.types";
import {
  getPriorityChipColor,
  getStatusChipColor,
  isTerminalStatus,
  PRIORITY_LABELS,
  STATUS_LABELS,
  toFormValues,
  toStatusUpdatePayload,
} from "../utils/radiologyUtils";

const RadiologyOrderDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canUpdate = Boolean(user?.isSuperuser || user?.permissions.includes("radiology:update"));
  const canDelete = Boolean(user?.isSuperuser || user?.permissions.includes("radiology:delete"));

  const { data: radiologyOrder, isLoading, isError, refetch } = useRadiologyOrder(id);
  const { data: consultation } = useConsultation(radiologyOrder?.consultationId);
  const updateStatus = useUpdateRadiologyOrderStatus();
  const deleteRadiologyOrder = useDeleteRadiologyOrder();
  const { snackbar, showSuccess, showError, closeSnackbar } = useRadiologyOrderSnackbar();

  const [pendingDelete, setPendingDelete] = useState(false);
  const [nextStatus, setNextStatus] = useState<RadiologyStatus>("ordered");
  const [statusNotes, setStatusNotes] = useState("");
  const [statusError, setStatusError] = useState<string | null>(null);

  useConsumeFlashMessage(showSuccess);

  const defaultValues = useMemo(() => (radiologyOrder ? toFormValues(radiologyOrder) : null), [radiologyOrder]);

  const availableStatuses = useMemo(
    () => (radiologyOrder ? STATUS_OPTIONS.filter((status) => status !== radiologyOrder.status) : []),
    [radiologyOrder]
  );

  useEffect(() => {
    if (availableStatuses.length > 0) {
      setNextStatus(availableStatuses[0]);
    }
  }, [availableStatuses]);

  if (isLoading) {
    return <RadiologyOrderDetailsSkeleton />;
  }

  if (isError || !radiologyOrder || !defaultValues) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => void refetch()}>
            Retry
          </Button>
        }
      >
        Radiology order not found, or the request failed. Please try again.
      </Alert>
    );
  }

  const handleStatusUpdate = async () => {
    if (!id) return;
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
      await deleteRadiologyOrder.mutateAsync(id);
      navigate("/radiology/orders", {
        replace: true,
        state: { flashMessage: `Radiology order ${radiologyOrder.orderNumber} was deleted.` },
      });
    } catch {
      showError("Could not delete radiology order. Please try again.");
      setPendingDelete(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate("/radiology/orders")}>
          Back to Radiology Orders
        </Button>
        <Stack direction="row" spacing={1} sx={{ flex: 1, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <Chip label={PRIORITY_LABELS[radiologyOrder.priority]} color={getPriorityChipColor(radiologyOrder.priority)} />
          <Chip label={STATUS_LABELS[radiologyOrder.status]} color={getStatusChipColor(radiologyOrder.status)} />
          {canDelete && !isTerminalStatus(radiologyOrder.status) && (
            <Button color="error" startIcon={<DeleteOutlineRoundedIcon />} onClick={() => setPendingDelete(true)}>
              Delete
            </Button>
          )}
        </Stack>
      </Stack>

      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Radiology Order {radiologyOrder.orderNumber}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {radiologyOrder.patientName ?? "Patient"} • Visit {radiologyOrder.consultationVisitNumber ?? "—"}
        </Typography>
      </Box>

      <RadiologyOrderForm
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
          <StatusTimeline statusHistory={radiologyOrder.statusHistory} />
        </CardContent>
      </Card>

      {canUpdate && !isTerminalStatus(radiologyOrder.status) && (
        <Card variant="outlined">
          <CardHeader title="Update Status" />
          <Divider />
          <CardContent>
            <Stack spacing={2}>
              {statusError && <Alert severity="error">{statusError}</Alert>}
              <TextField
                select
                label="New Status"
                value={nextStatus}
                onChange={(event) => setNextStatus(event.target.value as RadiologyStatus)}
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
                  disabled={updateStatus.isPending || availableStatuses.length === 0}
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

      <ImagingRequestPrint radiologyOrderId={radiologyOrder.id} />

      <RadiologyOrderDeleteDialog
        radiologyOrder={pendingDelete ? radiologyOrder : null}
        isDeleting={deleteRadiologyOrder.isPending}
        onConfirm={() => void handleConfirmDelete()}
        onClose={() => setPendingDelete(false)}
      />
      <RadiologyOrderSnackbar state={snackbar} onClose={closeSnackbar} />
    </Stack>
  );
};

export default RadiologyOrderDetailsPage;
