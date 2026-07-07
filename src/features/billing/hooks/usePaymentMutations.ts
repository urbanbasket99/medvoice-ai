import { useMutation, useQueryClient } from "@tanstack/react-query";

import { billingApi } from "../api/billingApi";
import { billingQueryKeys } from "../api/billingQueries";
import type { CreatePaymentPayload } from "../types/billing.types";

export const usePaymentMutations = () => {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (payload: CreatePaymentPayload) => billingApi.createPayment(payload),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: billingQueryKeys.all }),
  });

  return { create };
};
