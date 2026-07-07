import { useMutation, useQueryClient } from "@tanstack/react-query";

import { radiologyApi } from "../api/radiologyApi";
import { radiologyQueryKeys } from "../api/radiologyQueries";
import type { CreateRadiologyOrderPayload } from "../types/radiology.types";

export const useCreateRadiologyOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRadiologyOrderPayload) => radiologyApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: radiologyQueryKeys.all });
    },
  });
};
