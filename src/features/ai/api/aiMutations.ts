import { useMutation, useQueryClient } from "@tanstack/react-query";

import { aiApi } from "./aiApi";
import { aiQueryKeys } from "./aiQueries";
import type { AiSettings, TestAiPayload, UpdateAiSettingsPayload } from "../types/ai.types";

export const useUpdateAiSettingsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateAiSettingsPayload) => aiApi.updateSettings(payload),
    onSuccess: (updated: AiSettings) => {
      queryClient.setQueryData(aiQueryKeys.settings(), updated);
      void queryClient.invalidateQueries({ queryKey: aiQueryKeys.providers() });
      void queryClient.invalidateQueries({ queryKey: aiQueryKeys.all });
    },
  });
};

export const useTestAiMutation = () =>
  useMutation({
    mutationFn: (payload: TestAiPayload) => aiApi.test(payload),
  });
