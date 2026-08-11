"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";

import type { PublicCatalog } from "@/lib/services/types";

type CatalogState = { locale: string; data: PublicCatalog } | null;

/**
 * Fetches the public service catalog for the current locale from the
 * `/api/public/catalog` feed. Returns `null` (the calling component renders a
 * loading state) until data for the current locale is available.
 */
export function usePublicCatalog(): PublicCatalog | null {
  const locale = useLocale();
  const [state, setState] = useState<CatalogState>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/public/catalog?locale=${locale}`)
      .then((res) => {
        if (!res.ok) throw new Error(`catalog fetch failed: ${res.status}`);
        return res.json() as Promise<PublicCatalog>;
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