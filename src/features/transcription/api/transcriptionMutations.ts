import { useMutation, useQueryClient } from "@tanstack/react-query";

import { transcriptionApi } from "./transcriptionApi";
import { transcriptionQueryKeys } from "./transcriptionQueries";
import type {
  StartTranscriptionPayload,
  Transcription,
  UpdateTranscriptionPayload,
  UploadTranscriptionPayload,
} from "../types/transcription.types";

export const useUploadTranscriptionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UploadTranscriptionPayload) => transcriptionApi.upload(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: transcriptionQueryKeys.all });
    },
  });
};

export const useStartTranscriptionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: StartTranscriptionPayload) => transcriptionApi.start(payload),
    onSuccess: (transcription: Transcription) => {
      queryClient.setQueryData(transcriptionQueryKeys.detail(transcription.id), transcription);
      if (transcription.recordingId) {
        queryClient.setQueryData(
          transcriptionQueryKeys.byRecording(transcription.recordingId),
          transcription
        );
      }
      void queryClient.invalidateQueries({ queryKey: transcriptionQueryKeys.lists() });
    },
  });
};

export const useUpdateTranscriptionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTranscriptionPayload }) =>
      transcriptionApi.update(id, payload),
    onSuccess: (transcription: Transcription) => {
      queryClient.setQueryData(transcriptionQueryKeys.detail(transcription.id), transcription);
      void queryClient.invalidateQueries({ queryKey: transcriptionQueryKeys.lists() });
    },
  });
};

export const useRetryTranscriptionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transcriptionApi.retry(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: transcriptionQueryKeys.all });
    },
  });
};

export const useDeleteTranscriptionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transcriptionApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: transcriptionQueryKeys.all });
    },
  });
};
