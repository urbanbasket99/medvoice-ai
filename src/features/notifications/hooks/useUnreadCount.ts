import { useQuery } from "@tanstack/react-query";

import { unreadCountQueryOptions } from "../api/notificationsQueries";

// Polls every 30 s. Replace polling with a WebSocket/SSE subscription
// in useNotificationRealtime.ts when the real-time backend is ready.
export const useUnreadCount = () => useQuery(unreadCountQueryOptions());
