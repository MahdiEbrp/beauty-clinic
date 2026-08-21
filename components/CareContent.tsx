import type { ReactNode } from "react";
import { BookOpen, HeartPulse, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { getCareGuidesForPublic } from "@/lib/services/service";
import type { PublicCareGuide, PublicCareGuideItem } from "@/lib/services/care-guides-types";
import type { Locale } from "@/lib/services/types";

function itemIcon(item: PublicCareGuideItem) {
  const Icon = item.highlighted ? HeartPulse : Sparkles;
  return <Icon className="size-5 shrink-0 text-copper" strokeWidth={2} aria-hidden="true" />;
}

function GuideSection({
  guide,
  highlightedLabel,
  normalLabel,
}: {
  guide: PublicCareGuide;
  highlightedLabel: string;
  normalLabel: string;
}) {
  return (
    <article>
      <div className="mb-6 flex items-center gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-control border border-border-primary bg-surface-secondary text-copper">
          <BookOpen className="size-6" strokeWidth={2} aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-heading-2 font-bold text-accent">{guide.name}</h2>
          {guide.description && (
            <p className="text-body-sm text-content-secondary">{guide.description}</p>
          )}
        </div>
      </div>

      {guide.items.length === 0 ? (
        <div className="rounded-panel border border-border-primary bg-surface-secondary p-6 text-content-secondary">
          {normalLabel}
        </div>
      ) : (
        <ol className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {guide.items.map((item) => (
            <li key={item.id}>
              <div
                className={`h-full rounded-panel border p-5 ${
                  item.highlighted
                    ? "border-warning/40 bg-warning/10"
                    : "border-border-primary bg-surface-secondary"
                }`}
              >
                <div className="mb-2 flex items-start gap-3">
                  {itemIcon(item)}
                  <h3 className="font-bold text-accent">{item.title}</h3>
                </div>
                <p className="text-body-sm text-content-secondary leading-relaxed">
                  {item.description?.length ? item.description : normalLabel}
                </p>
                {item.highlighted && (
                  <span className="mt-3 inline-flex rounded-pill border border-warning/40 bg-warning/10 px-2 py-0.5 text-dash-caption font-bold text-warning">
                    {highlightedLabel}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}

export default async function CareContent({
  locale,
}: {
  locale: string;
}): Promise<ReactNode> {
  const t = await getTranslations({ locale, namespace: "care" });
  const guides = await getCareGuidesForPublic(locale as Locale, {
    status: "active",
  });

  return (
    <section className="py-24 bg-surface-primary">
      <div className="max-w-content mx-auto px-6">
        <div className="mb-16 max-w-prose">
          <h1 className="text-heading-1 mb-4 text-accent">{t("heading")}</h1>
          <p className="text-content-secondary">{t("description")}</p>
        </div>

        {guides.length === 0 ? (
          <div className="text-center py-12 text-content-secondary">
            {t("empty")}
          </div>
        ) : (
          <div className="space-y-16">
            {guides.map((guide) => (
              <GuideSection
                key={guide.id}
                guide={guide}
                highlightedLabel={t("highlighted")}
                normalLabel={t("notProvided")}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
