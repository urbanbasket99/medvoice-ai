import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import { notificationsApi } from "./notificationsApi";
import type { NotificationListParams } from "../types/notification.types";

export const notificationQueryKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationQueryKeys.all, "list"] as const,
  list: (params: NotificationListParams) => [...notificationQueryKeys.lists(), params] as const,
  infiniteLists: () => [...notificationQueryKeys.all, "infinite"] as const,
  infiniteList: (params: Omit<NotificationListParams, "page">) =>
    [...notificationQueryKeys.infiniteLists(), params] as const,
  unreadCount: () => [...notificationQueryKeys.all, "unread-count"] as const,
  preferences: () => [...notificationQueryKeys.all, "preferences"] as const,
};

export const notificationsListQueryOptions = (params: NotificationListParams) =>
  queryOptions({
    queryKey: notificationQueryKeys.list(params),
    queryFn: () => notificationsApi.list(params),
  });

export const notificationsInfiniteQueryOptions = (
  params: Omit<NotificationListParams, "page">,
) =>
  infiniteQueryOptions({
    queryKey: notificationQueryKeys.infiniteList(params),
    queryFn: ({ pageParam }) =>
      notificationsApi.list({ ...params, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });

export const unreadCountQueryOptions = () =>
  queryOptions({
    queryKey: notificationQueryKeys.unreadCount(),
    queryFn: () => notificationsApi.getUnreadCount(),
    // Polls every 30 s. Replace with WebSocket/SSE invalidation when real-time backend is ready.
    refetchInterval: 30_000,
  });

export const notificationPreferencesQueryOptions = () =>
  queryOptions({
    queryKey: notificationQueryKeys.preferences(),
    queryFn: () => notificationsApi.getPreferences(),
  });
