"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";

import type { PublicLanding } from "@/lib/landing";

type LandingState = { locale: string; data: PublicLanding } | null;

/**
 * Fetches the public landing content for the current locale from the
 * `/api/public/landing` feed. Returns `null` (the calling component renders a
 * loading/empty state) until data for the current locale is available.
 */
export function usePublicLanding(): PublicLanding | null {
  const locale = useLocale();
  const [state, setState] = useState<LandingState>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/public/landing?locale=${locale}`)
      .then((res) => {
        if (!res.ok) throw new Error(`landing fetch failed: ${res.status}`);
        return res.json() as Promise<PublicLanding>;
      })
      .then((data) => {
        if (active) setState({ locale, data });
      })
      .catch(() => {
        // Leave the current state untouched so the UI keeps its last data.
      });
    return () => {
      active = false;
    };
  }, [locale]);

  return state && state.locale === locale ? state.data : null;
}
