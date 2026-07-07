import { useMutation, useQueryClient } from "@tanstack/react-query";

import { laboratoryApi } from "../api/laboratoryApi";
import { laboratoryQueryKeys } from "../api/laboratoryQueries";
import type { LabOrder, UpdateLabOrderPayload } from "../types/laboratory.types";

export interface UpdateLabOrderVariables {
  id: string;
  payload: UpdateLabOrderPayload;
}

export const useUpdateLabOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateLabOrderVariables) => laboratoryApi.update(id, payload),
    onSuccess: (updated: LabOrder) => {
      queryClient.setQueryData(laboratoryQueryKeys.detail(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: laboratoryQueryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: laboratoryQueryKeys.searches() });
      void queryClient.invalidateQueries({ queryKey: laboratoryQueryKeys.print(updated.id) });
    },
  });
};
