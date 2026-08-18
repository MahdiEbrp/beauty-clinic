import { getTranslations } from "next-intl/server";

import GroupGlyph from "@/components/create-group/GroupGlyph";
import { pricingImage } from "@/data/pricing-media";
import type { PublicRule } from "@/lib/services/rules-types";
import type { Locale } from "@/lib/services/types";

interface RuleCardProps {
  rule: PublicRule;
  locale: Locale;
}

/**
 * A wide, single-column rule card following the pricing CategoryCard visual
 * language: dark panel, image band with gradient + glassy icon chip and a
 * copper "important" badge, and a contrast body. The image is locked to a
 * fixed 3:2 (600×400) box that cover-fits, so it never stretches or upscales.
 */
export default async function RuleCard({
  rule,
  locale,
}: RuleCardProps): Promise<React.ReactElement> {
  const t = await getTranslations({ locale, namespace: "rules" });

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-card border border-border-primary bg-primary-deep shadow-elevation-2 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-elevation-4 lg:flex-row ${
        rule.highlighted ? "rule-card-important" : ""
      }`}
    >
      {/* Image band — fixed 3:2 (600×400) box. `aspect-[3/2]` pins the ratio at
          every breakpoint and `lg:self-start` stops the row layout from
          stretching the box to the body height; cover-fit never distorts. */}
      <div className="relative aspect-[3/2] shrink-0 overflow-hidden lg:w-1/2 lg:self-start">
        <img
          src={pricingImage(rule.image)}
          alt={rule.name}
          width={600}
          height={400}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div
          className="absolute inset-0 bg-linear-to-t from-primary-deep via-primary-deep/10 to-transparent"
          aria-hidden="true"
        />
        <div className="absolute inset-x-3 top-3 z-10 flex items-center justify-between">
          <span className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-surface-secondary/20 text-content-contrast backdrop-blur-sm">
            <GroupGlyph
              name={rule.icon ?? "Sparkles"}
              className="size-5"
              strokeWidth={1.75}
            />
          </span>
          {rule.highlighted && (
            <span className="rounded-full bg-copper px-3 py-1 text-caption font-bold text-content-contrast shadow-elevation-2">
              {t("card.highlighted")}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col px-6 pb-6 pt-5 text-content-contrast lg:p-8">
        <h2 className="mb-2 text-heading-3 font-bold leading-tight text-content-contrast">
          {rule.name}
        </h2>
        {rule.description && (
          <p className="max-w-prose text-body-sm leading-relaxed text-content-contrast/85">
            {rule.description}
          </p>
        )}
      </div>
    </article>
  );
}
