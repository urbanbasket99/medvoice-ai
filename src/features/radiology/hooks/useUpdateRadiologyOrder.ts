import { useMutation, useQueryClient } from "@tanstack/react-query";

import { radiologyApi } from "../api/radiologyApi";
import { radiologyQueryKeys } from "../api/radiologyQueries";
import type { RadiologyOrder, UpdateRadiologyOrderPayload } from "../types/radiology.types";

export interface UpdateRadiologyOrderVariables {
  id: string;
  payload: UpdateRadiologyOrderPayload;
}

export const useUpdateRadiologyOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateRadiologyOrderVariables) => radiologyApi.update(id, payload),
    onSuccess: (updated: RadiologyOrder) => {
      queryClient.setQueryData(radiologyQueryKeys.detail(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: radiologyQueryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: radiologyQueryKeys.searches() });
      void queryClient.invalidateQueries({ queryKey: radiologyQueryKeys.print(updated.id) });
    },
  });
};
