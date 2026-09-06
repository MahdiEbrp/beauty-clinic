"use client";

import { useEffect, useRef, useState } from "react";

const cache = new Map<string, { data: unknown; fetchedAt: number }>();

type StaleFetchOptions<T> = {
  /** Unique cache key — reuse it to serve cached data across mounts. */
  key: string;
  fetcher: () => Promise<T>;
  /** Milliseconds the cached response is served while revalidating (default 60s). */
  staleTime?: number;
  /** First render data (SSR) so there is no loading flash. */
  initialData?: T | null;
};

/**
 * Zero-dependency stale-while-revalidate fetch. Serves the cached value
 * immediately, revalidates in the background, and keeps the freshest response
 * cached module-wide so re-mounts stay instant. Swappable for TanStack Query
 * later (same signatures) if the dataset ever grows.
 */
export function useStaleFetch<T>({
  key,
  fetcher,
  staleTime = 60_000,
  initialData = null,
}: StaleFetchOptions<T>) {
  const [data, setData] = useState<T | null>(() => {
    const entry = cache.get(key);
    return entry ? (entry.data as T) : initialData;
  });
  const [isValidating, setIsValidating] = useState(false);
  const [hasLoadFailed, setHasLoadFailed] = useState(false);
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const load = async (force: boolean) => {
    const entry = cache.get(key);
    if (!force && entry && Date.now() - entry.fetchedAt < staleTime) {
      setData(entry.data as T);
      return;
    }
    setIsValidating(true);
    setHasLoadFailed(false);
    try {
      const result = await fetcherRef.current();
      cache.set(key, { data: result, fetchedAt: Date.now() });
      setData(result);
    } catch {
      setHasLoadFailed(true);
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const entry = cache.get(key);
      if (!entry || Date.now() - entry.fetchedAt >= staleTime) {
        setIsValidating(true);
        setHasLoadFailed(false);
        try {
          const result = await fetcherRef.current();
          if (cancelled) return;
          cache.set(key, { data: result, fetchedAt: Date.now() });
          setData(result);
        } catch {
          if (!cancelled) setHasLoadFailed(true);
        } finally {
          if (!cancelled) setIsValidating(false);
        }
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [key, staleTime]);

  const revalidate = async () => {
    await load(true);
  };

  return { data, isValidating, hasLoadFailed, revalidate };
}