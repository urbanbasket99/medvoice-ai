import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { voiceApi } from "./voiceApi";
import type { VoiceRecordingListParams } from "../types/voice.types";

export const voiceQueryKeys = {
  all: ["voice"] as const,
  lists: () => [...voiceQueryKeys.all, "list"] as const,
  list: (params: VoiceRecordingListParams) => [...voiceQueryKeys.lists(), params] as const,
  details: () => [...voiceQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...voiceQueryKeys.details(), id] as const,
};

export const voiceRecordingsListQueryOptions = (params: VoiceRecordingListParams) =>
  queryOptions({
    queryKey: voiceQueryKeys.list(params),
    queryFn: () => voiceApi.list(params),
    placeholderData: keepPreviousData,
  });

export const voiceRecordingDetailQueryOptions = (id: string | undefined) =>
  queryOptions({
    queryKey: voiceQueryKeys.detail(id ?? "unknown"),
    queryFn: () => voiceApi.getById(id as string),
    enabled: Boolean(id),
  });
