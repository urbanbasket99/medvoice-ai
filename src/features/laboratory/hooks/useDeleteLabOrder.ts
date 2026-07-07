import { useMutation, useQueryClient } from "@tanstack/react-query";

import { laboratoryApi } from "../api/laboratoryApi";
import { laboratoryQueryKeys } from "../api/laboratoryQueries";

export const useDeleteLabOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => laboratoryApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: laboratoryQueryKeys.all });
    },
  });
};
