import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  notificationPreferencesQueryOptions,
  notificationQueryKeys,
} from "../api/notificationsQueries";
import { notificationsApi } from "../api/notificationsApi";
import type { UpdateNotificationPreferencesPayload } from "../types/notification.types";

export const useNotificationPreferences = () =>
  useQuery(notificationPreferencesQueryOptions());

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateNotificationPreferencesPayload) =>
      notificationsApi.updatePreferences(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(notificationQueryKeys.preferences(), data);
    },
  });
};
