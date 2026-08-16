import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { Direction as DirectionPrimitive } from "radix-ui";
import { routing } from "@/src/i18n/routing";
import { canonicalUrl, dirForLocale } from "@/lib/site";
import { getClinicData } from "@/data/clinic";
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
    keywords: [
      "beauty clinic",
      "facial",
      "skincare",
      "کلینیک زیبایی",
      "فیشیال",
      "پوست",
    ],
    alternates: { canonical: canonicalUrl(locale) },
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
    },
    robots: { index: true, follow: true },
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
  const clinicData = await getClinicData();
  const session = await getSessionCached();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <DirectionPrimitive.DirectionProvider dir={dirForLocale(locale)}>
        <DirSetter />
        <JsonLd />
        <AppChrome user={session?.user ?? null} clinic={clinicData} skipLabel={t("skipToContent")}>
          {children}
        </AppChrome>
      </DirectionPrimitive.DirectionProvider>
    </NextIntlClientProvider>
  );
}
