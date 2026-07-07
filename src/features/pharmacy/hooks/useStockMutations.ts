import { useMutation, useQueryClient } from "@tanstack/react-query";

import { pharmacyApi } from "../api/pharmacyApi";
import { pharmacyQueryKeys } from "../api/pharmacyQueries";
import type { StockAdjustPayload } from "../types/pharmacy.types";

export const useAdjustStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: StockAdjustPayload) => pharmacyApi.adjustStock(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pharmacyQueryKeys.stock() });
    },
  });
};
