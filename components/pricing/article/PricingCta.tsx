import { CalendarPlus, ArrowRight } from "lucide-react";
import { Link } from "@/src/i18n/navigation";
import type { PricingCta as PricingCtaType } from "@/lib/services/pricing-page";

type PricingCtaProps = {
  cta: PricingCtaType;
  onPrimaryClick?: () => void;
};

/** Call-to-action panel for the pricing article (driven by DB `pricing.cta.*` settings). */
export default function PricingCta({ cta, onPrimaryClick }: PricingCtaProps) {
  if (!cta.title && !cta.primaryLabel) return null;

  const primaryUrl = cta.primaryUrl || "/booking";
  const hasPrimaryClick = typeof onPrimaryClick === "function";

  return (
    <section className="w-full">
      <div className="rounded-card bg-accent p-6 sm:p-10 text-on-primary shadow-elevation-3 relative overflow-hidden">
        <div className="absolute -inset-e-12 -top-12 size-48 rounded-full bg-copper/15 blur-2xl pointer-events-none" aria-hidden="true" />

        <div className="relative z-10 max-w-2xl">
          {cta.title ? (
            <h2 className="mb-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
              {cta.title}
            </h2>
          ) : null}
          {cta.description ? (
            <p className="mb-6 text-sm sm:text-base text-on-primary/80 leading-relaxed">
              {cta.description}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
            {cta.primaryLabel ? (
              <Link
                href={primaryUrl}
                onClick={(e) => {
                  if (hasPrimaryClick) {
                    e.preventDefault();
                    onPrimaryClick?.();
                  }
                }}
                className="inline-flex min-h-11 items-center gap-2 rounded-pill bg-copper px-6 text-sm font-bold text-content-contrast shadow-elevation-2 transition-colors hover:bg-copper-strong focus-visible:outline-2 focus-visible:outline-white"
              >
                <CalendarPlus className="size-4" aria-hidden="true" />
                {cta.primaryLabel}
              </Link>
            ) : null}
            {cta.secondaryLabel && cta.secondaryUrl ? (
              <Link
                href={cta.secondaryUrl}
                className="inline-flex min-h-11 items-center gap-2 rounded-control border border-white/30 bg-white/10 px-5 text-sm font-bold text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
              >
                {cta.secondaryLabel}
                <ArrowRight className="size-4 rtl-mirror" aria-hidden="true" />
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
export { PricingCta };
