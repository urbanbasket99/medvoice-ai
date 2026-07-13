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
import LabOrderDeleteDialog from "../components/LabOrderDeleteDialog";
import LabOrderDetailsSkeleton from "../components/LabOrderDetailsSkeleton";
import LabOrderForm from "../components/LabOrderForm";
import LabOrderSnackbar from "../components/LabOrderSnackbar";
import LabRequisitionPrint from "../components/LabRequisitionPrint";
import LabResultsForm from "../components/LabResultsForm";
import LabResultsEmail from "../components/LabResultsEmail";
import LabResultsPrint from "../components/LabResultsPrint";
import StatusTimeline from "../components/StatusTimeline";
import { useConsumeFlashMessage } from "../hooks/useConsumeFlashMessage";
import { useDeleteLabOrder } from "../hooks/useDeleteLabOrder";
import { useLabOrder } from "../hooks/useLabOrder";
import { useLabOrderSnackbar } from "../hooks/useLabOrderSnackbar";
import { useUpdateLabOrderStatus } from "../hooks/useUpdateLabOrderStatus";
import { STATUS_OPTIONS } from "../schemas/laboratorySchema";
import type { LabStatus } from "../types/laboratory.types";
import {
  getPriorityChipColor,
  getStatusChipColor,
  isTerminalStatus,
  PRIORITY_LABELS,
  STATUS_LABELS,
  toFormValues,
  toStatusUpdatePayload,
} from "../utils/laboratoryUtils";

const RESULTS_PRINT_STATUSES = new Set(["sample_collected", "in_progress", "completed"]);
const LabOrderDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canUpdate = Boolean(user?.isSuperuser || user?.permissions.includes("laboratory:update"));
  const canDelete = Boolean(user?.isSuperuser || user?.permissions.includes("laboratory:delete"));

  const { data: labOrder, isLoading, isError, refetch } = useLabOrder(id);
  const { data: consultation } = useConsultation(labOrder?.consultationId);
  const updateStatus = useUpdateLabOrderStatus();
  const deleteLabOrder = useDeleteLabOrder();
  const { snackbar, showSuccess, showError, closeSnackbar } = useLabOrderSnackbar();

  const [pendingDelete, setPendingDelete] = useState(false);
  const [nextStatus, setNextStatus] = useState<LabStatus>("ordered");
  const [statusNotes, setStatusNotes] = useState("");
  const [statusError, setStatusError] = useState<string | null>(null);

  useConsumeFlashMessage(showSuccess);

  const defaultValues = useMemo(() => (labOrder ? toFormValues(labOrder) : null), [labOrder]);

  const availableStatuses = useMemo(
    () => (labOrder ? STATUS_OPTIONS.filter((status) => status !== labOrder.status) : []),
    [labOrder]
  );

  useEffect(() => {
    if (availableStatuses.length > 0) {
      setNextStatus(availableStatuses[0]);
    }
  }, [availableStatuses]);

  if (isLoading) {
    return <LabOrderDetailsSkeleton />;
  }

  if (isError || !labOrder || !defaultValues) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => void refetch()}>
            Retry
          </Button>
        }
      >
        Lab order not found, or the request failed. Please try again.
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
      await deleteLabOrder.mutateAsync(id);
      navigate("/laboratory/orders", {
        replace: true,
        state: { flashMessage: `Lab order ${labOrder.orderNumber} was deleted.` },
      });
    } catch {
      showError("Could not delete lab order. Please try again.");
      setPendingDelete(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate("/laboratory/orders")}>
          Back to Lab Orders
        </Button>
        <Stack direction="row" spacing={1} sx={{ flex: 1, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <Chip label={PRIORITY_LABELS[labOrder.priority]} color={getPriorityChipColor(labOrder.priority)} />
          <Chip label={STATUS_LABELS[labOrder.status]} color={getStatusChipColor(labOrder.status)} />
          {canDelete && !isTerminalStatus(labOrder.status) && (
            <Button color="error" startIcon={<DeleteOutlineRoundedIcon />} onClick={() => setPendingDelete(true)}>
              Delete
            </Button>
          )}
        </Stack>
      </Stack>

      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Lab Order {labOrder.orderNumber}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {labOrder.patientName ?? "Patient"} • Visit {labOrder.consultationVisitNumber ?? "—"}
        </Typography>
      </Box>

      <LabOrderForm
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
          <StatusTimeline statusHistory={labOrder.statusHistory} />
        </CardContent>
      </Card>

      {canUpdate && !isTerminalStatus(labOrder.status) && (
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
                onChange={(event) => setNextStatus(event.target.value as LabStatus)}
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

      <LabResultsForm
        labOrder={labOrder}
        canUpdate={canUpdate}
        onSaved={() => showSuccess("Lab results saved.")}
      />

      <LabRequisitionPrint labOrderId={labOrder.id} />

      {RESULTS_PRINT_STATUSES.has(labOrder.status) && <LabResultsPrint labOrderId={labOrder.id} />}

      {RESULTS_PRINT_STATUSES.has(labOrder.status) && canUpdate && (
        <LabResultsEmail labOrderId={labOrder.id} />
      )}

      <LabOrderDeleteDialog
        labOrder={pendingDelete ? labOrder : null}
        isDeleting={deleteLabOrder.isPending}
        onConfirm={() => void handleConfirmDelete()}
        onClose={() => setPendingDelete(false)}
      />
      <LabOrderSnackbar state={snackbar} onClose={closeSnackbar} />
    </Stack>
  );
};

export default LabOrderDetailsPage;
