import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { transcriptionApi } from "./transcriptionApi";
import type { TranscriptionListParams } from "../types/transcription.types";

export const transcriptionQueryKeys = {
  all: ["transcriptions"] as const,
  lists: () => [...transcriptionQueryKeys.all, "list"] as const,
  list: (params: TranscriptionListParams) => [...transcriptionQueryKeys.lists(), params] as const,
  details: () => [...transcriptionQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...transcriptionQueryKeys.details(), id] as const,
  byRecording: (recordingId: string) => [...transcriptionQueryKeys.all, "recording", recordingId] as const,
};

export const transcriptionsListQueryOptions = (params: TranscriptionListParams) =>
  queryOptions({
    queryKey: transcriptionQueryKeys.list(params),
    queryFn: () => transcriptionApi.list(params),
    placeholderData: keepPreviousData,
  });

export const transcriptionDetailQueryOptions = (id: string | undefined) =>
  queryOptions({
    queryKey: transcriptionQueryKeys.detail(id ?? "unknown"),
    queryFn: () => transcriptionApi.getById(id as string),
    enabled: Boolean(id),
  });

export const transcriptionByRecordingQueryOptions = (recordingId: string | undefined) =>
  queryOptions({
    queryKey: transcriptionQueryKeys.byRecording(recordingId ?? "unknown"),
    queryFn: () => transcriptionApi.getByRecordingId(recordingId as string),
    enabled: Boolean(recordingId),
    retry: false,
  });
