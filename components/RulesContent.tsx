import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

import GroupGlyph from "@/components/create-group/GroupGlyph";
import { siteUrl } from "@/lib/site";
import { getRulesForPublic } from "@/lib/services/rules-admin";
import type { PublicRule } from "@/lib/services/rules-types";
import type { Locale } from "@/lib/services/types";

interface RuleCardProps {
  rule: PublicRule;
}

function RuleCard({ rule }: RuleCardProps) {
  return (
    <article
      className="bg-surface-secondary border border-border-primary rounded-panel p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-elevation-2"
      {...(rule.highlighted
        ? { "data-highlighted": true }
        : {})}
    >
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-surface-primary text-copper rounded-control flex items-center justify-center shrink-0 border border-border-primary">
          <GroupGlyph name={rule.icon ?? "Sparkles"} className="w-6 h-6" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-body-lg font-bold text-accent mb-2">
            {rule.name}
          </h2>
          {rule.description && (
            <p className="text-body-sm text-content-secondary leading-relaxed">
              {rule.description}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

interface RulesContentProps {
  locale: string;
}

export default async function RulesContent({
  locale,
}: RulesContentProps): Promise<ReactNode> {
  const t = await getTranslations({ locale, namespace: "rules" });
  const rules = await getRulesForPublic(locale as Locale, {
    status: "active",
  });

  return (
    <section className="py-24 bg-surface-primary">
      <div className="max-w-content mx-auto px-6">
        <div className="mb-16 max-w-prose">
          <h1 className="text-heading-1 mb-4 text-accent">{t("heading")}</h1>
          <p className="text-content-secondary">{t("description")}</p>
        </div>

        {rules.length === 0 ? (
          <div className="text-center py-12 text-content-secondary">
            {t("empty")}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rules.map((rule) => (
              <RuleCard key={rule.id} rule={rule} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "rules" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      canonical: `${siteUrl}/${locale}/rules`,
      languages: {
        fa: `${siteUrl}/fa/rules`,
        en: `${siteUrl}/en/rules`,
      },
    },
    openGraph: {
      title: t("meta.title"),
      description: t("meta.description"),
      type: "website",
    },
  };
}
