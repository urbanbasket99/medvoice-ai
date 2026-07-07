import { useMutation, useQueryClient } from "@tanstack/react-query";

import { voiceApi } from "./voiceApi";
import { voiceQueryKeys } from "./voiceQueries";
import type { VoiceRecording } from "../types/voice.types";

export const useStartRecordingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (consultationId: string) => voiceApi.start(consultationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: voiceQueryKeys.all });
    },
  });
};

export interface StopRecordingVariables {
  recordingId: string;
  durationSeconds: number;
}

export const useStopRecordingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ recordingId, durationSeconds }: StopRecordingVariables) =>
      voiceApi.stop(recordingId, durationSeconds),
    onSuccess: (recording: VoiceRecording) => {
      queryClient.setQueryData(voiceQueryKeys.detail(recording.id), recording);
      void queryClient.invalidateQueries({ queryKey: voiceQueryKeys.lists() });
    },
  });
};

export interface UploadRecordingVariables {
  recordingId: string;
  file: Blob;
  durationSeconds: number;
  fileName?: string;
}

export const useUploadRecordingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ recordingId, file, durationSeconds, fileName }: UploadRecordingVariables) =>
      voiceApi.upload(recordingId, file, durationSeconds, fileName),
    onSuccess: (recording: VoiceRecording) => {
      queryClient.setQueryData(voiceQueryKeys.detail(recording.id), recording);
      void queryClient.invalidateQueries({ queryKey: voiceQueryKeys.lists() });
    },
  });
};

export const useDeleteVoiceRecordingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => voiceApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: voiceQueryKeys.all });
    },
  });
};
