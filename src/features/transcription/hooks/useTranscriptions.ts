import { useQuery } from "@tanstack/react-query";

import {
  transcriptionByRecordingQueryOptions,
  transcriptionDetailQueryOptions,
  transcriptionsListQueryOptions,
} from "../api/transcriptionQueries";
import type { TranscriptionListParams } from "../types/transcription.types";

export const useTranscriptions = (params: TranscriptionListParams) =>
  useQuery(transcriptionsListQueryOptions(params));

export const useTranscription = (id: string | undefined) => useQuery(transcriptionDetailQueryOptions(id));

export const useTranscriptionByRecording = (recordingId: string | undefined) =>
  useQuery(transcriptionByRecordingQueryOptions(recordingId));
