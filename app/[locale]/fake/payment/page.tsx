import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, CreditCard, ShieldCheck, XCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/src/i18n/navigation";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ authority?: string; order?: string }>;
};

/**
 * Simulated payment gateway for exercising the checkout path without a real
 * PSP. It must never be reachable in production: it is public, unauthenticated,
 * and renders a "payment succeeded" surface that an attacker could point a
 * victim at. The robots rules only ask crawlers to skip it; this makes it
 * actually absent from a production deploy.
 */
function assertGatewayEnabled(): void {
  if (process.env.NODE_ENV === "production" && process.env.FAKE_PAYMENT_ENABLED !== "true") {
    notFound();
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "fakeGateway" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: false, follow: false },
  };
}

export default async function FakePaymentPage({ searchParams }: PageProps) {
  assertGatewayEnabled();
  const t = await getTranslations("fakeGateway");
  const { authority, order } = await searchParams;

  return (
    <section className="mx-auto w-full max-w-xl px-3 py-8 sm:px-6 sm:py-12">
      <div className="overflow-hidden rounded-panel border border-border-primary bg-surface-primary shadow-elevation-3 animate-zoom-in">
        <header className="bg-accent px-4 py-5 text-content-contrast sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-control bg-success text-copper-light shadow-elevation-1">
              <CreditCard className="size-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-caption font-bold text-copper-light">
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                {t("testBadge")}
              </p>
              <h1 className="mt-1 text-heading-3 font-black tracking-tight">{t("title")}</h1>
            </div>
          </div>
        </header>

        <div className="space-y-5 p-4 sm:p-6">
          {authority ? (
            <>
              <p className="text-body leading-relaxed text-content-secondary">{t("description")}</p>

              <dl className="rounded-control border border-border-primary bg-surface-secondary px-3">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-border-primary/70 py-3 last:border-b-0">
                  <dt className="text-caption text-content-tertiary">{t("labels.authority")}</dt>
                  <dd dir="ltr" className="ms-auto break-all text-body-sm font-black text-content-primary">{authority}</dd>
                </div>
                {order ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-border-primary/70 py-3 last:border-b-0">
                    <dt className="text-caption text-content-tertiary">{t("labels.order")}</dt>
                    <dd dir="ltr" className="ms-auto break-all text-body-sm font-black text-content-primary">{order}</dd>
                  </div>
                ) : null}
              </dl>

              <div className="flex flex-col gap-2.5 sm:flex-row">
                <a
                  href={`/api/v1/payments/callback?${new URLSearchParams({ Authority: authority, status: "OK" })}`}
                  className="inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-control bg-accent px-4 text-body-sm font-black text-content-contrast shadow-elevation-1 transition-all hover:bg-accent-hover active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <CheckCircle2 className="size-4 text-copper-light" aria-hidden="true" />
                  {t("pay")}
                </a>
                <a
                  href={`/api/v1/payments/callback?${new URLSearchParams({ Authority: authority, status: "BAD" })}`}
                  className="inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-control border border-border-interactive bg-surface-secondary px-4 text-body-sm font-bold text-content-primary transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <XCircle className="size-4 text-copper" aria-hidden="true" />
                  {t("cancel")}
                </a>
              </div>
            </>
          ) : (
            <>
              <p className="text-body leading-relaxed text-content-secondary">{t("invalidDescription")}</p>
              <Link
                href="/booking"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-control bg-accent px-4 text-body-sm font-black text-content-contrast shadow-elevation-1 transition-all hover:bg-accent-hover active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {t("booking")}
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}