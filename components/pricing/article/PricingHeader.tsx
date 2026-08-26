import { Sparkles } from "lucide-react";

type PricingHeaderProps = {
  title: string;
  intro: string | null;
  updatedLabel: string | null;
  badgeLabel?: string;
};

/** Page header: DB-driven H1, badge, intro paragraph and "last updated" line. */
export default function PricingHeader({
  title,
  intro,
  updatedLabel,
  badgeLabel = "",
}: PricingHeaderProps) {
  return (
    <header className="flex flex-col gap-2.5 max-w-3xl">
      {badgeLabel ? (
        <div className="inline-flex items-center gap-2 self-start rounded-pill border border-border-interactive bg-surface-secondary px-3 py-1 text-xs font-semibold text-copper">
          <Sparkles className="size-3.5" aria-hidden="true" />
          <span>{badgeLabel}</span>
        </div>
      ) : null}
      <h1 className="text-3xl font-extrabold text-accent tracking-tight sm:text-4xl">
        {title}
      </h1>
      {intro ? (
        <p className="text-sm text-content-secondary leading-relaxed max-w-2xl">
          {intro}
        </p>
      ) : null}
      {updatedLabel ? (
        <p className="text-[11px] font-medium text-content-tertiary">
          {updatedLabel}
        </p>
      ) : null}
    </header>
  );
}
export { PricingHeader };
