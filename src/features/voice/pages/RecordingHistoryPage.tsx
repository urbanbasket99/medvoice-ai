import { useState } from "react";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import MicRoundedIcon from "@mui/icons-material/MicRounded";
import { useNavigate } from "react-router-dom";
import type { GridPaginationModel, GridSortModel } from "@mui/x-data-grid";

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
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

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
      setFeedback({ type: "success", message: "Recording deleted successfully." });
      setPendingDelete(null);
    } catch {
      setFeedback({ type: "error", message: "Could not delete the recording. Please try again." });
    }
  };

  if (!canRead) {
    return <Alert severity="warning">You do not have permission to view recording history.</Alert>;
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Recording History
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Browse, play back, download, and manage saved consultation recordings.
          </Typography>
        </Box>
        {canRecord && (
          <Button variant="contained" startIcon={<MicRoundedIcon />} onClick={() => navigate("/voice/record")}>
            New Recording
          </Button>
        )}
      </Stack>

      {feedback && (
        <Alert severity={feedback.type} onClose={() => setFeedback(null)}>
          {feedback.message}
        </Alert>
      )}

      {listQuery.isError && (
        <Alert severity="error" action={<Button onClick={() => void listQuery.refetch()}>Retry</Button>}>
          Could not load recordings.
        </Alert>
      )}

      <VoiceRecordingTable
        rows={rows}
        rowCount={rowCount}
        loading={listQuery.isLoading}
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
    </Stack>
  );
};

export default RecordingHistoryPage;
