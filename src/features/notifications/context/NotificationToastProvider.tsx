import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

import NotificationToast from "../components/NotificationToast";
import { notificationsApi } from "../api/notificationsApi";
import { notificationQueryKeys } from "../api/notificationsQueries";
import type { Notification } from "../types/notification.types";

interface NotificationToastContextValue {
  /** Imperatively show a toast for a notification (e.g. from a WebSocket handler). */
  showToast: (notification: Notification) => void;
}

const NotificationToastContext = createContext<NotificationToastContextValue | null>(null);

export const useNotificationToast = (): NotificationToastContextValue => {
  const ctx = useContext(NotificationToastContext);
  if (!ctx) {
    throw new Error("useNotificationToast must be used inside NotificationToastProvider");
  }
  return ctx;
};

export interface NotificationToastProviderProps {
  children: ReactNode;
  /**
   * Polling interval in ms (default 30 000).
   * Replace the polling loop below with a WebSocket/SSE subscription
   * (via useNotificationRealtime) when the backend supports real-time push.
   */
  pollIntervalMs?: number;
}

export const NotificationToastProvider = ({
  children,
  pollIntervalMs = 30_000,
}: NotificationToastProviderProps) => {
  const queryClient = useQueryClient();
  const [toastNotification, setToastNotification] = useState<Notification | null>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);

  const showToast = useCallback((notification: Notification) => {
    setToastNotification(notification);
  }, []);

  useEffect(() => {
    const poll = async () => {
      try {
        const result = await notificationsApi.list({ page: 1, pageSize: 20 });

        // Keep the unread count badge in sync without a second request.
        void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount() });

        if (!initializedRef.current) {
          // First poll: seed seen-set so we don't toast pre-existing notifications.
          result.items.forEach((n) => seenIdsRef.current.add(n.id));
          initializedRef.current = true;
          return;
        }

        const newItems = result.items.filter((n) => !seenIdsRef.current.has(n.id));
        newItems.forEach((n) => seenIdsRef.current.add(n.id));

        if (newItems.length > 0) {
          showToast(newItems[0]);
        }
      } catch {
        // Silently ignore poll errors — the UI stays functional without toasts.
      }
    };

    void poll();
    const interval = setInterval(() => void poll(), pollIntervalMs);
    return () => clearInterval(interval);
  }, [pollIntervalMs, queryClient, showToast]);

  return (
    <NotificationToastContext.Provider value={{ showToast }}>
      {children}
      <NotificationToast
        notification={toastNotification}
        onClose={() => setToastNotification(null)}
      />
    </NotificationToastContext.Provider>
  );
};
