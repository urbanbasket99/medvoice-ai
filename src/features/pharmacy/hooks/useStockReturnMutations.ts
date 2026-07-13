import { useMutation, useQueryClient } from "@tanstack/react-query";

import { pharmacyApi } from "../api/pharmacyApi";
import { pharmacyQueryKeys } from "../api/pharmacyQueries";
import type { StockReturnPayload } from "../types/pharmacy.types";

export const usePurchaseReturn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: StockReturnPayload) => pharmacyApi.purchaseReturn(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pharmacyQueryKeys.stock() });
    },
  });
};

export const useSalesReturn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: StockReturnPayload) => pharmacyApi.salesReturn(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pharmacyQueryKeys.stock() });
    },
  });
};
