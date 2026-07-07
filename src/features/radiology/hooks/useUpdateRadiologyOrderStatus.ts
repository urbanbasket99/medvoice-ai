import { useMutation, useQueryClient } from "@tanstack/react-query";

import { radiologyApi } from "../api/radiologyApi";
import { radiologyQueryKeys } from "../api/radiologyQueries";
import type { RadiologyOrder, UpdateRadiologyOrderStatusPayload } from "../types/radiology.types";

export interface UpdateRadiologyOrderStatusVariables {
  id: string;
  payload: UpdateRadiologyOrderStatusPayload;
}

export const useUpdateRadiologyOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateRadiologyOrderStatusVariables) => radiologyApi.updateStatus(id, payload),
    onSuccess: (updated: RadiologyOrder) => {
      queryClient.setQueryData(radiologyQueryKeys.detail(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: radiologyQueryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: radiologyQueryKeys.searches() });
      void queryClient.invalidateQueries({ queryKey: radiologyQueryKeys.print(updated.id) });
    },
  });
};
