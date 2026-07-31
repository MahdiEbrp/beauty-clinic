"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";

export default function DirSetter() {
  const locale = useLocale();

  useEffect(() => {
    const dir = locale === "fa" ? "rtl" : "ltr";
    if (document.documentElement.dir !== dir) {
      document.documentElement.dir = dir;
    }
    if (document.documentElement.lang !== locale) {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  return null;
}
