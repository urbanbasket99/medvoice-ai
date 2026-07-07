import { useMutation, useQueryClient } from "@tanstack/react-query";

import { pharmacyApi } from "../api/pharmacyApi";
import { pharmacyQueryKeys } from "../api/pharmacyQueries";
import type {
  CreateDispensePayload,
  UpdateDispensePayload,
  UpdateDispenseStatusPayload,
} from "../types/pharmacy.types";

export const useCreateDispense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDispensePayload) => pharmacyApi.createDispense(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pharmacyQueryKeys.dispenses() });
      void queryClient.invalidateQueries({ queryKey: pharmacyQueryKeys.stock() });
    },
  });
};

export const useUpdateDispense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDispensePayload }) =>
      pharmacyApi.updateDispense(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pharmacyQueryKeys.dispenses() });
    },
  });
};

export const useUpdateDispenseStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDispenseStatusPayload }) =>
      pharmacyApi.updateDispenseStatus(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pharmacyQueryKeys.dispenses() });
      void queryClient.invalidateQueries({ queryKey: pharmacyQueryKeys.stock() });
    },
  });
};

export const useDeleteDispense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pharmacyApi.removeDispense(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pharmacyQueryKeys.dispenses() });
    },
  });
};
