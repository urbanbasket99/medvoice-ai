import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { notificationQueryKeys } from "../api/notificationsQueries";

// ---------------------------------------------------------------------------
// Real-time notification provider interface.
// Implement this interface with a WebSocket or SSE class and pass it as
// `provider` to opt out of polling once the backend supports real-time push.
// ---------------------------------------------------------------------------
export interface RealtimeNotificationProvider {
  connect: () => void;
  disconnect: () => void;
  onMessage: (handler: (notification: unknown) => void) => void;
}

interface UseNotificationRealtimeOptions {
  /** Custom real-time provider. Falls back to polling when omitted. */
  provider?: RealtimeNotificationProvider;
  /** Polling interval in ms when no provider is supplied (default 30 000). */
  pollIntervalMs?: number;
  enabled?: boolean;
}

/**
 * Stub hook that keeps notification data fresh via polling.
 * Pass a `provider` (WebSocket / SSE) to switch to push-based updates.
 */
export const useNotificationRealtime = ({
  provider,
  pollIntervalMs = 30_000,
  enabled = true,
}: UseNotificationRealtimeOptions = {}) => {
  const queryClient = useQueryClient();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    if (provider) {
      provider.connect();
      provider.onMessage(() => {
        void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount() });
        void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.infiniteLists() });
      });
      return () => provider.disconnect();
    }

    intervalRef.current = setInterval(() => {
      void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount() });
    }, pollIntervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, pollIntervalMs, provider, queryClient]);
};
