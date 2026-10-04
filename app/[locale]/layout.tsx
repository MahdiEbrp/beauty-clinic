import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { Direction as DirectionPrimitive } from "radix-ui";
import { routing } from "@/src/i18n/routing";
import { buildAlternates, dirForLocale } from "@/lib/site";
import { getClinicData } from "@/data/clinic";
import { getPublicNavCatalog } from "@/lib/services/public-nav-catalog";
import { getSessionCached } from "@/lib/auth/dal";
import AppChrome from "@/components/AppChrome";
import JsonLd from "@/components/JsonLd";
import DirSetter from "@/components/DirSetter";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates(locale, "/"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
      locale: locale === "fa" ? "fa_IR" : "en_US",
      siteName: t("name"),
    },
    // `max-image-preview: large` is what makes the site's imagery eligible for
    // large thumbnails in Google image and mobile results; without it Google
    // defaults to a tiny thumbnail. `-1` means "no limit" for snippets and
    // video previews. Keywords are intentionally omitted — Google has ignored
    // them since 2009 and they forced hardcoded bilingual strings into a
    // per-locale layout.
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const messages = await getMessages({ locale });
  const t = await getTranslations({ locale, namespace: "a11y" });
  // Both are hard-cached (shared KV/memory); safe to resolve together.
  const [clinicData, catalog] = await Promise.all([
    getClinicData(locale),
    getPublicNavCatalog(locale),
  ]);
  const session = await getSessionCached();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <DirectionPrimitive.DirectionProvider dir={dirForLocale(locale)}>
        <DirSetter />
        <JsonLd />
        <AppChrome
          user={session?.user ?? null}
          clinic={clinicData}
          catalog={catalog}
          skipLabel={t("skipToContent")}
        >
          {children}
        </AppChrome>
      </DirectionPrimitive.DirectionProvider>
    </NextIntlClientProvider>
  );
}
