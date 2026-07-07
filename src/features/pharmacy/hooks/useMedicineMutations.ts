import { useMutation, useQueryClient } from "@tanstack/react-query";

import { pharmacyApi } from "../api/pharmacyApi";
import { pharmacyQueryKeys } from "../api/pharmacyQueries";
import type { CreateMedicinePayload, UpdateMedicinePayload } from "../types/pharmacy.types";

export const useCreateMedicine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMedicinePayload) => pharmacyApi.createMedicine(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pharmacyQueryKeys.medicines() });
    },
  });
};

export const useUpdateMedicine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateMedicinePayload }) =>
      pharmacyApi.updateMedicine(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pharmacyQueryKeys.medicines() });
    },
  });
};

export const useDeleteMedicine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pharmacyApi.removeMedicine(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pharmacyQueryKeys.medicines() });
    },
  });
};
