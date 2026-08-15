import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import {
  Clock,
  Sparkles,
  Car,
  Users,
  Hourglass,
  CalendarX,
  Shield,
  FileText,
  MapPin,
  Phone,
  Calendar as CalendarIcon,
  UserCheck,
  CreditCard,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { siteUrl } from "@/lib/site";
import { getRulesForPublic } from "@/lib/services/rules-admin";
import type { PublicRule } from "@/lib/services/rules-types";
import type { Locale } from "@/lib/services/types";

const iconMap: Record<string, LucideIcon> = {
  clock: Clock,
  sparkles: Sparkles,
  car: Car,
  users: Users,
  hourglass: Hourglass,
  calendarX: CalendarX,
  shield: Shield,
  fileText: FileText,
  mapPin: MapPin,
  phone: Phone,
  calendar: CalendarIcon,
  userCheck: UserCheck,
  creditCard: CreditCard,
};

interface RuleCardProps {
  rule: PublicRule;
}

function RuleCard({ rule }: RuleCardProps) {
  const Icon = iconMap[rule.icon ?? ""] ?? Clock;
  const colorClass = colorMap[rule.color ?? "default"] ?? colorMap.default;

  return (
    <article
      className="bg-surface-secondary border border-border-primary rounded-panel p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-elevation-2"
      {...(rule.highlighted
        ? { "data-highlighted": true }
        : {})}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 ${colorClass} rounded-control flex items-center justify-center shrink-0 border border-border-primary`}
        >
          <Icon className="w-6 h-6" strokeWidth={2} aria-hidden="true" />
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

const colorMap: Record<string, string> = {
  peach: "text-peach bg-peach/10",
  gold: "text-gold bg-gold/10",
  copper: "text-copper bg-copper/10",
  rose: "text-rose bg-rose/10",
  sand: "text-sand bg-sand/10",
  accent: "text-accent bg-accent/10",
  default: "text-accent bg-accent/10",
};

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
