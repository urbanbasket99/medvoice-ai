import { useMutation, useQueryClient } from "@tanstack/react-query";

import { prescriptionsApi } from "./prescriptionsApi";
import { prescriptionsQueryKeys } from "./prescriptionsQueries";
import type { CreatePrescriptionPayload, Prescription, UpdatePrescriptionPayload } from "../types/prescription.types";

export const useCreatePrescriptionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePrescriptionPayload) => prescriptionsApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: prescriptionsQueryKeys.all });
    },
  });
};

export interface UpdatePrescriptionVariables {
  id: string;
  payload: UpdatePrescriptionPayload;
}

export const useUpdatePrescriptionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdatePrescriptionVariables) => prescriptionsApi.update(id, payload),
    onSuccess: (updated: Prescription) => {
      queryClient.setQueryData(prescriptionsQueryKeys.detail(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: prescriptionsQueryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: prescriptionsQueryKeys.searches() });
      void queryClient.invalidateQueries({ queryKey: prescriptionsQueryKeys.print(updated.id) });
    },
  });
};

export const useDeletePrescriptionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => prescriptionsApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: prescriptionsQueryKeys.all });
    },
  });
};

export const useExportPrescriptionPdfMutation = () =>
  useMutation({
    mutationFn: (id: string) => prescriptionsApi.exportPdf(id),
  });
