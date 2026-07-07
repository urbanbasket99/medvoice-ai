import { useMutation, useQueryClient } from "@tanstack/react-query";

import { pharmacyApi } from "../api/pharmacyApi";
import { pharmacyQueryKeys } from "../api/pharmacyQueries";
import type { CreateBatchPayload, UpdateBatchPayload } from "../types/pharmacy.types";

export const useCreateBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBatchPayload) => pharmacyApi.createBatch(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pharmacyQueryKeys.batches() });
      void queryClient.invalidateQueries({ queryKey: pharmacyQueryKeys.stock() });
    },
  });
};

export const useUpdateBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBatchPayload }) =>
      pharmacyApi.updateBatch(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pharmacyQueryKeys.batches() });
      void queryClient.invalidateQueries({ queryKey: pharmacyQueryKeys.stock() });
    },
  });
};
