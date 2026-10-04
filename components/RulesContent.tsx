import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

import RuleCard from "@/components/RuleCard";
import { buildAlternates } from "@/lib/site";
import { getRulesForPublic } from "@/lib/services/rules-admin";
import type { Locale } from "@/lib/services/types";

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
          <div className="grid grid-cols-1 gap-6 lg:gap-8">
            {rules.map((rule) => (
              <RuleCard
                key={rule.id}
                rule={rule}
                locale={locale as Locale}
              />
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
    alternates: buildAlternates(locale, "/rules"),
    openGraph: {
      title: t("meta.title"),
      description: t("meta.description"),
      type: "website",
    },
  };
}
