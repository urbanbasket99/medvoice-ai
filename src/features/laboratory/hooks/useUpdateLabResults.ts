import { useMutation, useQueryClient } from "@tanstack/react-query";

import { laboratoryApi } from "../api/laboratoryApi";
import { laboratoryQueryKeys } from "../api/laboratoryQueries";
import type { LabOrder, UpdateLabResultsPayload } from "../types/laboratory.types";

export interface UpdateLabResultsVariables {
  id: string;
  payload: UpdateLabResultsPayload;
}

export const useUpdateLabResults = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateLabResultsVariables) => laboratoryApi.updateResults(id, payload),
    onSuccess: (updated: LabOrder) => {
      queryClient.setQueryData(laboratoryQueryKeys.detail(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: laboratoryQueryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: laboratoryQueryKeys.searches() });
      void queryClient.invalidateQueries({ queryKey: laboratoryQueryKeys.print(updated.id) });
      void queryClient.invalidateQueries({ queryKey: laboratoryQueryKeys.resultsPrint(updated.id) });
    },
  });
};
