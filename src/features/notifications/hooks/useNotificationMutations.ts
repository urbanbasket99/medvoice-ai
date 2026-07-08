import { useMutation, useQueryClient } from "@tanstack/react-query";

import { notificationsApi } from "../api/notificationsApi";
import { notificationQueryKeys } from "../api/notificationsQueries";

const invalidateAll = (queryClient: ReturnType<typeof useQueryClient>) => {
  void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.lists() });
  void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.infiniteLists() });
  void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount() });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => invalidateAll(queryClient),
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => invalidateAll(queryClient),
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.delete(id),
    onSuccess: () => invalidateAll(queryClient),
  });
};
