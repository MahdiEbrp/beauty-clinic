import { getTranslations } from "next-intl/server";
import { CalendarPlus } from "lucide-react";
import { Link } from "@/src/i18n/navigation";
import { pageUrl } from "@/lib/site";
import CategoryBreadcrumb, {
  type BreadcrumbCrumb,
} from "@/components/category-page/CategoryBreadcrumb";
import CategoryJsonLd, {
  type BreadcrumbItem,
} from "@/components/category-page/CategoryJsonLd";
import ServicesIndexGroup from "./ServicesIndexGroup";
import FloatingBookingButton from "@/components/FloatingBookingButton";
import type { ServicesIndexData } from "@/lib/services/services-index";

type ServicesIndexProps = {
  data: ServicesIndexData;
  locale: string;
};

/**
 * Server-rendered hub for the public `/services` landing page: breadcrumb +
 * H1 + intro, one section per treatment group (categories link into the SEO
 * group/category pages), a booking CTA and the floating reserve button.
 */
export default async function ServicesIndex({
  data,
  locale,
}: ServicesIndexProps) {
  const t = await getTranslations({ locale, namespace: "servicesPage" });

  const crumbs: BreadcrumbCrumb[] = [
    { label: t("breadcrumb.home"), href: "/" },
    { label: t("breadcrumb.services"), href: "/services" },
  ];

  const absoluteCrumbs: BreadcrumbItem[] = crumbs.map((crumb) => ({
    label: crumb.label,
    href: pageUrl(locale, crumb.href),
  }));

  return (
    <div className="min-h-screen bg-surface-primary text-content-primary">
      <CategoryJsonLd crumbs={absoluteCrumbs} />
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 lg:pb-16">
        <header className="mb-6">
          <CategoryBreadcrumb crumbs={crumbs} />
          <div className="mt-6 flex flex-col gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-accent sm:text-4xl">
              {t("heading")}
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-content-secondary sm:text-base">
              {t("description")}
            </p>
          </div>
        </header>

        <div className="divide-y divide-border-primary/60">
          {data.groups.map((group) => (
            <ServicesIndexGroup key={group.slug} group={group} locale={locale} />
          ))}
        </div>

        <section className="mt-14">
          <div className="rounded-card bg-accent p-6 text-on-primary shadow-elevation-3 sm:p-10">
            <h2 className="mb-2 text-2xl font-extrabold tracking-tight">
              {t("cta.heading")}
            </h2>
            <p className="mb-6 max-w-2xl text-sm text-on-primary/80 leading-relaxed sm:text-base">
              {t("cta.description")}
            </p>
            <Link
              href="/booking"
              className="inline-flex min-h-12 items-center gap-2 rounded-pill bg-copper px-8 py-3 text-sm font-bold text-content-contrast shadow-elevation-2 transition-colors hover:bg-copper-strong focus-visible:outline-2 focus-visible:outline-white"
            >
              <CalendarPlus className="size-4" aria-hidden="true" />
              {t("cta.book")}
            </Link>
          </div>
        </section>
      </div>

      <FloatingBookingButton />
    </div>
  );
}