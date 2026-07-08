import { useInfiniteQuery } from "@tanstack/react-query";

import { notificationsInfiniteQueryOptions } from "../api/notificationsQueries";
import type { NotificationListParams } from "../types/notification.types";

export const useNotifications = (params: Omit<NotificationListParams, "page"> = {}) =>
  useInfiniteQuery(notificationsInfiniteQueryOptions(params));
