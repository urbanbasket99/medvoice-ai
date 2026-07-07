import { useMutation, useQueryClient } from "@tanstack/react-query";

import { billingApi } from "../api/billingApi";
import { billingQueryKeys } from "../api/billingQueries";
import type { CreateInvoicePayload, UpdateInvoicePayload } from "../types/billing.types";

export const useInvoiceMutations = () => {
  const queryClient = useQueryClient();

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: billingQueryKeys.all });

  const create = useMutation({
    mutationFn: (payload: CreateInvoicePayload) => billingApi.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateInvoicePayload }) =>
      billingApi.update(id, payload),
    onSuccess: invalidate,
  });

  const issue = useMutation({
    mutationFn: (id: string) => billingApi.issue(id),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => billingApi.remove(id),
    onSuccess: invalidate,
  });

  return { create, update, issue, remove };
};
