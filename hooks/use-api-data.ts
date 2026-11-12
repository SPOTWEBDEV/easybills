"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export function useApiData<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const fn = useRef(fetcher);
  fn.current = fetcher;
  const depKey = JSON.stringify(deps);

  const load = useCallback(async (quiet: boolean) => {
    quiet ? setRefreshing(true) : setLoading(true);
    try {
      setData(await fn.current());
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(false);
  }, [load, depKey]);

  useEffect(() => {
    const onFocus = () => load(true); // like the app's useFocusEffect
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load]);

  return { data, loading, refreshing, error, refresh: () => load(true) };
}
