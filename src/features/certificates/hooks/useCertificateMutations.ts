import { useMutation, useQueryClient } from "@tanstack/react-query";

import { certificatesApi } from "../api/certificatesApi";
import { certificatesQueryKeys } from "../api/certificatesQueries";
import type { CreateCertificatePayload, UpdateCertificatePayload } from "../types/certificate.types";

export const useCertificateMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () => void queryClient.invalidateQueries({ queryKey: certificatesQueryKeys.all });

  const create = useMutation({
    mutationFn: (payload: CreateCertificatePayload) => certificatesApi.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCertificatePayload }) =>
      certificatesApi.update(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => certificatesApi.remove(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
};
