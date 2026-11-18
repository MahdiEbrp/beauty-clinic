import { getTranslations } from "next-intl/server";
import type { CategoryPageCategory } from "@/lib/services/category-page";

type CategoryDetailsProps = {
  category: CategoryPageCategory;
  locale: string;
};

/**
 * Editorial treatment overview for a category landing page.
 * Content comes from the localized service catalog; this component deliberately
 * stays informational and does not add booking or purchase prompts.
 */
export default async function CategoryDetails({
  category,
  locale,
}: CategoryDetailsProps) {
  const t = await getTranslations({ locale });

  if (category.services.length === 0) return null;

  return (
    <section aria-labelledby="category-details-heading" className="mt-10">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-wide text-copper">
            {category.title}
          </p>
          <h2
            id="category-details-heading"
            className="mt-1 text-xl font-extrabold tracking-tight text-accent sm:text-2xl"
          >
            {t("categoryPage.services.heading", { title: category.title })}
          </h2>
        </div>
        <p className="text-caption text-content-tertiary">
          {t("categoryPage.services.subtitle", { count: category.services.length })}
        </p>
      </div>

      <div className="space-y-5">
        {category.services.map((service, index) => (
          <article
            key={service.id}
            className="overflow-hidden rounded-card border border-border-primary bg-surface-secondary shadow-elevation-1"
          >
            <div className="grid gap-0 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              {service.coverImage ? (
                <div className="relative min-h-56 bg-surface-tertiary md:min-h-full">
                  <img
                    src={service.coverImage}
                    alt={service.title}
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              ) : null}

              <div className="flex min-w-0 flex-col justify-center p-5 sm:p-7">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-full bg-copper/12 text-xs font-extrabold text-copper-strong">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-xs font-semibold text-content-tertiary">
                    {category.title}
                  </span>
                </div>

                <h3 className="text-lg font-extrabold tracking-tight text-accent sm:text-xl">
                  {service.title}
                </h3>

                {service.shortDesc ? (
                  <p className="mt-2 text-sm font-medium leading-7 text-content-secondary">
                    {service.shortDesc}
                  </p>
                ) : null}

                {service.fullDesc ? (
                  <div className="mt-4 border-t border-border-primary/70 pt-4">
                    <p className="whitespace-pre-line text-sm leading-8 text-content-secondary">
                      {service.fullDesc}
                    </p>
                  </div>
                ) : null}

                {service.durationMin ? (
                  <div className="mt-5 inline-flex w-fit items-center gap-2 rounded-pill border border-border-primary bg-surface-primary px-3 py-2 text-xs font-semibold text-content-secondary">
                    <span>{t("booking.appointment.duration")}</span>
                    <span className="tabular-nums">{service.durationMin}</span>
                    <span>{t("booking.appointment.minutes")}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
