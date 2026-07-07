import { useMutation, useQueryClient } from "@tanstack/react-query";

import { radiologyApi } from "../api/radiologyApi";
import { radiologyQueryKeys } from "../api/radiologyQueries";

export const useDeleteRadiologyOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => radiologyApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: radiologyQueryKeys.all });
    },
  });
};
