import { QueryClient } from "@tanstack/react-query";

/**
 * Single app-wide `QueryClient` (provided once in `main.tsx`). Sensible
 * enterprise defaults: don't retry-storm on 4xx responses (Axios rejects
 * with `AxiosError`, which carries `response.status`), and avoid
 * refetching on every window focus for data that isn't second-by-second
 * volatile (patient records).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 2;
      },
    },
  },
});
