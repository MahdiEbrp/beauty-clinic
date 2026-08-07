"use client";

import { useEffect, useState } from "react";
import { useFormatter } from "next-intl";

/**
 * Renders a relative timestamp only after hydration. Relative times change
 * between server render and client render, which would otherwise trigger a
 * React hydration mismatch. Returns null before mount so both pass agree.
 */
export function RelativeTime({ value }: { value: Date | number }) {
  const format = useFormatter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  if (!mounted) return null;
  return format.relativeTime(value, new Date());
}
