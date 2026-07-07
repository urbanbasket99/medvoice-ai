import { useMutation, useQueryClient } from "@tanstack/react-query";

import { laboratoryApi } from "../api/laboratoryApi";
import { laboratoryQueryKeys } from "../api/laboratoryQueries";
import type { CreateLabOrderPayload } from "../types/laboratory.types";

export const useCreateLabOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLabOrderPayload) => laboratoryApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: laboratoryQueryKeys.all });
    },
  });
};
