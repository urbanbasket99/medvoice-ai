import { useMutation, useQueryClient } from "@tanstack/react-query";

import { consultationsApi } from "./consultationsApi";
import { consultationsQueryKeys } from "./consultationsQueries";
import type { Consultation, CreateConsultationPayload, UpdateConsultationPayload } from "../types/consultation.types";

export const useCreateConsultationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateConsultationPayload) => consultationsApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: consultationsQueryKeys.all });
    },
  });
};

export interface UpdateConsultationVariables {
  id: string;
  payload: UpdateConsultationPayload;
}

export const useUpdateConsultationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateConsultationVariables) => consultationsApi.update(id, payload),
    onSuccess: (updated: Consultation) => {
      queryClient.setQueryData(consultationsQueryKeys.detail(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: consultationsQueryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: consultationsQueryKeys.searches() });
    },
  });
};

export const useDeleteConsultationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => consultationsApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: consultationsQueryKeys.all });
    },
  });
};
