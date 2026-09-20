import { getTranslations } from "next-intl/server";
import { CalendarPlus } from "lucide-react";
import { Link } from "@/src/i18n/navigation";

type CategoryBookingCtaProps = {
  locale: string;
};

/**
 * Large, detailed "reserve" call-to-action for the category page — a full-width
 * accent panel with the booking button front and center, mirroring the pricing
 * page's CTA so the primary path to converting is impossible to miss.
 */
export default async function CategoryBookingCta({
  locale,
}: CategoryBookingCtaProps) {
  const t = await getTranslations({ locale, namespace: "categoryPage.cta" });

  return (
    <section className="mt-10">
      <div className="rounded-card bg-accent p-6 text-on-primary shadow-elevation-3 relative overflow-hidden sm:p-10">
        <div
          className="absolute -inset-e-12 -top-12 size-48 rounded-full bg-copper/15 blur-2xl pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative z-10 max-w-2xl">
          <h2 className="mb-2 text-2xl font-extrabold tracking-tight">{t("heading")}</h2>
          <p className="mb-6 text-sm leading-relaxed text-on-primary/80 sm:text-base">
            {t("description")}
          </p>
          <Link
            href="/booking"
            className="inline-flex min-h-13 items-center gap-2 rounded-pill bg-copper px-8 py-3.5 text-base font-bold text-content-contrast shadow-elevation-2 transition-colors hover:bg-copper-strong focus-visible:outline-2 focus-visible:outline-white"
          >
            <CalendarPlus className="size-5" aria-hidden="true" />
            {t("book")}
          </Link>
        </div>
      </div>
    </section>
  );
}