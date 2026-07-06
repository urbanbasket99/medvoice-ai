import { useMutation, useQueryClient } from "@tanstack/react-query";

import { patientsApi } from "./patientsApi";
import { patientsQueryKeys } from "./patientsQueries";
import type { CreatePatientPayload, Patient, UpdatePatientPayload } from "../types/patient.types";

export const useCreatePatientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePatientPayload) => patientsApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: patientsQueryKeys.all });
    },
  });
};

export interface UpdatePatientVariables {
  id: string;
  payload: UpdatePatientPayload;
}

export const useUpdatePatientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdatePatientVariables) => patientsApi.update(id, payload),
    onSuccess: (updated: Patient) => {
      queryClient.setQueryData(patientsQueryKeys.detail(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: patientsQueryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: patientsQueryKeys.searches() });
    },
  });
};

export const useDeletePatientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => patientsApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: patientsQueryKeys.all });
    },
  });
};
