import { useMutation, useQueryClient } from "@tanstack/react-query";

import { laboratoryApi } from "../api/laboratoryApi";
import { laboratoryQueryKeys } from "../api/laboratoryQueries";
import type { LabOrder, UpdateLabOrderStatusPayload } from "../types/laboratory.types";

export interface UpdateLabOrderStatusVariables {
  id: string;
  payload: UpdateLabOrderStatusPayload;
}

export const useUpdateLabOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateLabOrderStatusVariables) => laboratoryApi.updateStatus(id, payload),
    onSuccess: (updated: LabOrder) => {
      queryClient.setQueryData(laboratoryQueryKeys.detail(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: laboratoryQueryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: laboratoryQueryKeys.searches() });
      void queryClient.invalidateQueries({ queryKey: laboratoryQueryKeys.print(updated.id) });
    },
  });
};
