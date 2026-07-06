import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

import { tokenStorage } from "../utils/tokenStorage";
import type { RefreshApiResponse } from "./authApi.types";

/**
 * Central Axios instance for the whole app (not just the auth feature).
 * `withCredentials: true` is required so the browser sends/receives the
 * `httpOnly` refresh-token cookie on requests to the API origin.
 */
export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api/v1",
  withCredentials: true,
});

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const AUTH_ENDPOINTS_EXEMPT_FROM_REFRESH = ["/auth/login", "/auth/refresh"];

type SessionExpiredHandler = () => void;
let sessionExpiredHandler: SessionExpiredHandler | null = null;

/** Registered by `AuthProvider` so the interceptor can clear app state on an unrecoverable 401. */
export const setSessionExpiredHandler = (handler: SessionExpiredHandler | null): void => {
  sessionExpiredHandler = handler;
};

let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

const queueRequest = (callback: (token: string) => void): void => {
  pendingRequests.push(callback);
};

const flushQueue = (token: string): void => {
  pendingRequests.forEach((resolve) => resolve(token));
  pendingRequests = [];
};

httpClient.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const isUnauthorized = error.response?.status === 401;
    const isExemptEndpoint = AUTH_ENDPOINTS_EXEMPT_FROM_REFRESH.some((path) =>
      originalRequest?.url?.includes(path)
    );

    if (!originalRequest || !isUnauthorized || isExemptEndpoint || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve) => {
        queueRequest((token) => {
          originalRequest.headers.set("Authorization", `Bearer ${token}`);
          resolve(httpClient(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const { data } = await httpClient.post<RefreshApiResponse>("/auth/refresh");
      tokenStorage.set(data.access_token);
      flushQueue(data.access_token);
      originalRequest.headers.set("Authorization", `Bearer ${data.access_token}`);
      return httpClient(originalRequest);
    } catch (refreshError) {
      tokenStorage.clear();
      pendingRequests = [];
      sessionExpiredHandler?.();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
