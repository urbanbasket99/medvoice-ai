import { useMutation, useQueryClient } from "@tanstack/react-query";

import { doctorsApi } from "./doctorsApi";
import { doctorsQueryKeys } from "./doctorsQueries";
import type { CreateDoctorPayload, Doctor, UpdateDoctorPayload } from "../types/doctor.types";

export const useCreateDoctorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDoctorPayload) => doctorsApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: doctorsQueryKeys.all });
    },
  });
};

export interface UpdateDoctorVariables {
  id: string;
  payload: UpdateDoctorPayload;
}

export const useUpdateDoctorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateDoctorVariables) => doctorsApi.update(id, payload),
    onSuccess: (updated: Doctor) => {
      queryClient.setQueryData(doctorsQueryKeys.detail(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: doctorsQueryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: doctorsQueryKeys.searches() });
    },
  });
};

export const useDeleteDoctorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => doctorsApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: doctorsQueryKeys.all });
    },
  });
};
