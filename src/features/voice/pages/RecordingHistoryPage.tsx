import { useState } from "react";
import { Alert, Button, Stack } from "@mui/material";
import MicRoundedIcon from "@mui/icons-material/MicRounded";
import { useNavigate } from "react-router-dom";
import type { GridPaginationModel, GridSortModel } from "@mui/x-data-grid";

import AppSnackbar from "../../../components/ui/AppSnackbar";
import ErrorBanner from "../../../components/ui/ErrorBanner";
import PageHeader from "../../../components/ui/PageHeader";
import { useAuth } from "../../auth";
import DeleteRecordingDialog from "../components/DeleteRecordingDialog";
import VoiceRecordingTable from "../components/VoiceRecordingTable";
import { useDeleteVoiceRecording } from "../hooks/useDeleteVoiceRecording";
import { useVoiceRecordings } from "../hooks/useVoiceRecordings";
import type { VoiceRecording, VoiceRecordingSortField } from "../types/voice.types";

const SORT_FIELD_MAP: Record<string, VoiceRecordingSortField> = {
  createdAt: "created_at",
  durationSeconds: "duration_seconds",
  status: "status",
};

const DEFAULT_SORT_MODEL: GridSortModel = [{ field: "createdAt", sort: "desc" }];

const RecordingHistoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canRead = Boolean(user?.isSuperuser || user?.permissions.includes("voice:read"));
  const canRecord = Boolean(user?.isSuperuser || user?.permissions.includes("voice:record"));
  const canDelete = Boolean(user?.isSuperuser || user?.permissions.includes("voice:delete"));

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 20 });
  const [sortModel, setSortModel] = useState<GridSortModel>(DEFAULT_SORT_MODEL);
  const [pendingDelete, setPendingDelete] = useState<VoiceRecording | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const sortEntry = sortModel[0];
  const sortBy = (sortEntry && SORT_FIELD_MAP[sortEntry.field]) || "created_at";
  const sortDir = sortEntry?.sort === "asc" ? "asc" : "desc";

  const listQuery = useVoiceRecordings({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    sortBy,
    sortDir,
    status: "completed",
  });

  const deleteRecording = useDeleteVoiceRecording();
  const rows = listQuery.data?.items ?? [];
  const rowCount = listQuery.data?.total ?? 0;

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteRecording.mutateAsync(pendingDelete.id);
      setSnackbar({ open: true, message: "Recording deleted successfully.", severity: "success" });
      setPendingDelete(null);
    } catch {
      setSnackbar({ open: true, message: "Could not delete the recording. Please try again.", severity: "error" });
    }
  };

  if (!canRead) {
    return <Alert severity="warning">You do not have permission to view recording history.</Alert>;
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Recording History"
        subtitle="Browse, play back, download, and manage saved consultation recordings."
        actions={
          canRecord ? (
            <Button variant="contained" startIcon={<MicRoundedIcon />} onClick={() => navigate("/voice/record")}>
              New Recording
            </Button>
          ) : undefined
        }
      />

      {listQuery.isError && (
        <ErrorBanner message="Could not load recordings." onRetry={() => void listQuery.refetch()} />
      )}

      <VoiceRecordingTable
        rows={rows}
        rowCount={rowCount}
        loading={listQuery.isFetching}
        paginationModel={paginationModel}
        sortModel={sortModel}
        onPaginationModelChange={setPaginationModel}
        onSortModelChange={setSortModel}
        canDelete={canDelete}
        onDelete={setPendingDelete}
      />

      <DeleteRecordingDialog
        recording={pendingDelete}
        isDeleting={deleteRecording.isPending}
        onConfirm={() => void handleConfirmDelete()}
        onClose={() => setPendingDelete(null)}
      />

      <AppSnackbar
        state={{ ...snackbar, severity: snackbar.severity }}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </Stack>
  );
};

export default RecordingHistoryPage;
