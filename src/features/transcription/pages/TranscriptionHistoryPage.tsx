import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { useNavigate } from "react-router-dom";
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
} from "@mui/x-data-grid";

import { useAuth } from "../../auth";
import AppSnackbar from "../../../components/ui/AppSnackbar";
import ErrorBanner from "../../../components/ui/ErrorBanner";
import PageHeader from "../../../components/ui/PageHeader";
import { DataGridNoRowsOverlay, dataGridSlotProps, dataGridSx } from "../../../components/ui";
import DeleteTranscriptionDialog from "../components/DeleteTranscriptionDialog";
import AudioUploadCard from "../components/AudioUploadCard";
import TranscriptionStatusChip from "../components/TranscriptionStatusChip";
import { extractApiErrorMessage } from "../../../lib/extractApiErrorMessage";
import { useDeleteTranscription, useStartTranscription } from "../hooks/useTranscriptionMutations";
import { useTranscriptions } from "../hooks/useTranscriptions";
import type { Transcription } from "../types/transcription.types";
import { averageConfidence } from "../utils/transcriptionUtils";
import ConfidenceIndicator from "../components/ConfidenceIndicator";

const TranscriptionHistoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canDelete = Boolean(user?.isSuperuser || user?.permissions.includes("transcriptions:delete"));
  const canCreate = Boolean(user?.isSuperuser || user?.permissions.includes("transcriptions:create"));
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const [pendingDelete, setPendingDelete] = useState<Transcription | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const listQuery = useTranscriptions({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
  });
  const deleteTranscription = useDeleteTranscription();
  const startTranscription = useStartTranscription();

  const rows = listQuery.data?.items ?? [];
  const hasActiveJobs = rows.some((row) => row.status === "pending" || row.status === "processing");

  useEffect(() => {
    if (!hasActiveJobs) return undefined;
    const timer = window.setInterval(() => {
      void listQuery.refetch();
    }, 3000);
    return () => window.clearInterval(timer);
  }, [hasActiveJobs, listQuery.refetch]);

  const handleStartPending = useCallback(
    async (transcription: Transcription) => {
      try {
        await startTranscription.mutateAsync({
          transcriptionId: transcription.id,
          language: transcription.language ?? undefined,
        });
        await listQuery.refetch();
        setSnackbar({ open: true, message: "Transcription started.", severity: "success" });
      } catch (error) {
        setSnackbar({
          open: true,
          message: extractApiErrorMessage(error, "Could not start transcription."),
          severity: "error",
        });
      }
    },
    [listQuery, startTranscription]
  );

  const columns = useMemo<GridColDef<Transcription>[]>(
    () => [
      {
        field: "consultationVisitNumber",
        headerName: "Visit",
        flex: 0.8,
        minWidth: 110,
        valueGetter: (_, row) => row.consultationVisitNumber ?? "—",
      },
      {
        field: "patientName",
        headerName: "Patient",
        flex: 1.2,
        minWidth: 160,
        valueGetter: (_, row) => row.patientName ?? "—",
      },
      {
        field: "status",
        headerName: "Status",
        flex: 0.8,
        minWidth: 120,
        renderCell: ({ row }) => <TranscriptionStatusChip status={row.status} />,
      },
      {
        field: "confidence",
        headerName: "Confidence",
        flex: 0.7,
        minWidth: 110,
        sortable: false,
        renderCell: ({ row }) => (
          <ConfidenceIndicator confidence={averageConfidence(row.segments ?? [])} />
        ),
      },
      {
        field: "modelUsed",
        headerName: "Model",
        flex: 0.9,
        minWidth: 120,
        valueGetter: (_, row) => row.modelUsed ?? "—",
      },
      {
        field: "createdAt",
        headerName: "Created",
        flex: 1,
        minWidth: 170,
        valueGetter: (_, row) => new Date(row.createdAt).toLocaleString(),
      },
      {
        field: "actions",
        headerName: "Actions",
        sortable: false,
        width: 160,
        renderCell: ({ row }) => (
          <Stack direction="row">
            {canCreate && row.status === "pending" && (
              <Tooltip title="Start transcription">
                <IconButton size="small" color="primary" onClick={() => void handleStartPending(row)}>
                  <AutoAwesomeRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="View">
              <IconButton size="small" onClick={() => navigate(`/transcriptions/${row.id}`)}>
                <VisibilityRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {canDelete && (
              <Tooltip title="Delete">
                <IconButton size="small" color="error" onClick={() => setPendingDelete(row)}>
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        ),
      },
    ],
    [canCreate, canDelete, handleStartPending, navigate]
  );

  const handleUploaded = async () => {
    try {
      await listQuery.refetch();
    } catch {
      setSnackbar({
        open: true,
        message: "Transcription saved, but the history list could not be refreshed.",
        severity: "error",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteTranscription.mutateAsync(pendingDelete.id);
      setSnackbar({ open: true, message: "Transcription deleted.", severity: "success" });
      setPendingDelete(null);
    } catch {
      setSnackbar({ open: true, message: "Could not delete transcription.", severity: "error" });
    }
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Transcription History"
        subtitle="Review, edit, and manage consultation speech-to-text results."
      />

      {canCreate && <AudioUploadCard onUploaded={() => void handleUploaded()} />}

      {listQuery.isError && (
        <ErrorBanner message="Could not load transcription history." onRetry={() => void listQuery.refetch()} />
      )}

      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        rowCount={listQuery.data?.total ?? 0}
        loading={listQuery.isFetching}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 20, 50]}
        disableRowSelectionOnClick
        autoHeight
        slots={{ noRowsOverlay: DataGridNoRowsOverlay }}
        slotProps={dataGridSlotProps}
        sx={dataGridSx}
      />

      <DeleteTranscriptionDialog
        transcription={pendingDelete}
        isDeleting={deleteTranscription.isPending}
        onConfirm={() => void handleConfirmDelete()}
        onClose={() => setPendingDelete(null)}
      />

      <AppSnackbar
        state={snackbar}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </Stack>
  );
};

export default TranscriptionHistoryPage;
