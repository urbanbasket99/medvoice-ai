import { useState } from "react";
import { Box, IconButton, Stack, Tooltip } from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
  type GridSortModel,
} from "@mui/x-data-grid";

import { voiceApi } from "../api/voiceApi";
import VoiceRecordingStatusChip from "./VoiceRecordingStatusChip";
import type { VoiceRecording } from "../types/voice.types";
import { formatFileSize, formatRecordingDuration, triggerBlobDownload } from "../utils/voiceUtils";
import AudioPlayer from "./AudioPlayer";

const VoiceRecordingTable = ({
  rows,
  rowCount,
  loading,
  paginationModel,
  sortModel,
  onPaginationModelChange,
  onSortModelChange,
  canDelete,
  onDelete,
}: {
  rows: VoiceRecording[];
  rowCount: number;
  loading: boolean;
  paginationModel: GridPaginationModel;
  sortModel: GridSortModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  onSortModelChange: (model: GridSortModel) => void;
  canDelete: boolean;
  onDelete: (recording: VoiceRecording) => void;
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleDownload = async (recording: VoiceRecording) => {
    const blob = await voiceApi.downloadBlob(recording.id);
    triggerBlobDownload(blob, recording.fileName ?? `${recording.id}.webm`);
  };

  const columns: GridColDef<VoiceRecording>[] = [
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
      field: "doctorName",
      headerName: "Doctor",
      flex: 1,
      minWidth: 140,
      valueGetter: (_, row) => row.doctorName ?? "—",
    },
    {
      field: "durationSeconds",
      headerName: "Duration",
      flex: 0.7,
      minWidth: 100,
      valueGetter: (_, row) => formatRecordingDuration(row.durationSeconds),
    },
    {
      field: "fileSizeBytes",
      headerName: "Size",
      flex: 0.6,
      minWidth: 90,
      sortable: false,
      valueGetter: (_, row) => formatFileSize(row.fileSizeBytes),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.7,
      minWidth: 120,
      renderCell: ({ row }) => <VoiceRecordingStatusChip status={row.status} />,
    },
    {
      field: "createdAt",
      headerName: "Recorded",
      flex: 1,
      minWidth: 170,
      valueGetter: (_, row) => new Date(row.createdAt).toLocaleString(),
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      filterable: false,
      width: 140,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title={expandedId === row.id ? "Hide player" : "Play"}>
            <IconButton
              size="small"
              color="primary"
              onClick={() => setExpandedId((current) => (current === row.id ? null : row.id))}
            >
              <PlayArrowRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download">
            <IconButton size="small" onClick={() => void handleDownload(row)}>
              <DownloadRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {canDelete && (
            <Tooltip title="Delete">
              <IconButton size="small" color="error" onClick={() => onDelete(row)}>
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Stack spacing={2}>
      <Box sx={{ width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          rowCount={rowCount}
          loading={loading}
          paginationMode="server"
          sortingMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={onPaginationModelChange}
          sortModel={sortModel}
          onSortModelChange={onSortModelChange}
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick
          autoHeight
          sx={{ bgcolor: "background.paper" }}
        />
      </Box>
      {expandedId && (
        <Box sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 1 }}>
          <AudioPlayer recording={rows.find((row) => row.id === expandedId) ?? null} />
        </Box>
      )}
    </Stack>
  );
};

export default VoiceRecordingTable;
