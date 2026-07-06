import { useEffect, useState } from "react";

export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Small generic "fetch on mount" hook shared by every dashboard widget.
 * Deliberately minimal (no caching/retries) — this is the seam where a
 * real data-fetching library (e.g. TanStack Query) would slot in later
 * without changing any component that calls `useKpis`/`useAiActivity`/etc.
 */
export const useAsyncData = <T>(fetcher: () => Promise<T>): AsyncState<T> => {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    setState((previous) => ({ ...previous, isLoading: true, error: null }));

    fetcher()
      .then((data) => {
        if (isMounted) setState({ data, isLoading: false, error: null });
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : "Failed to load data.";
        if (isMounted) setState({ data: null, isLoading: false, error: message });
      });

    return () => {
      isMounted = false;
    };
    // `fetcher` is expected to be stable per-call-site (see hooks below);
    // re-running on every render would defeat the purpose of the hook.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
};
