import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { Direction as DirectionPrimitive } from "radix-ui";
import { routing } from "@/src/i18n/routing";
import { canonicalUrl, dirForLocale } from "@/lib/site";
import { getClinicData } from "@/data/clinic";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <DirectionPrimitive.DirectionProvider dir={dirForLocale(locale)}>
        <DirSetter />
        <JsonLd />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:inset-s-4 focus:z-100 focus:inline-flex focus:items-center focus:min-h-11 focus:px-6 focus:rounded-pill focus:bg-accent focus:text-content-contrast focus:font-bold focus:shadow-elevation-3"
        >
          {t("skipToContent")}
        </a>
        <Navbar />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer clinic={clinicData} />
      </DirectionPrimitive.DirectionProvider>
    </NextIntlClientProvider>
  );
}
