"use client";

import { useEffect, useState } from "react";

// PUBLIC_INTERFACE
export function useDebounce<T>(value: T, delayMs: number): T {
  /** Debounce any changing value by delayMs. */
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}
