import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type ReceiptRow = { label: string; value: ReactNode; ltr?: boolean };

type PaymentResultCardProps = {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  rows: ReceiptRow[];
  notice: string;
  tone: "success" | "failure";
  actions: ReactNode;
};

export default function PaymentResultCard({
  icon: Icon,
  eyebrow,
  title,
  description,
  rows,
  notice,
  tone,
  actions,
}: PaymentResultCardProps) {
  const isSuccess = tone === "success";
  const toneClass = isSuccess ? "bg-success" : "bg-error";
  const iconClass = isSuccess ? "text-copper-light" : "text-content-contrast";
  const noticeClass = isSuccess
    ? "border-copper/25 bg-copper/5 text-copper-strong"
    : "border-error/30 bg-error/5 text-error";

  return (
    <section className="mx-auto w-full max-w-xl px-3 py-8 sm:px-6 sm:py-12">
      <div className="overflow-hidden rounded-panel border border-border-primary bg-surface-primary shadow-elevation-3 animate-zoom-in">
        <header className="bg-accent px-4 py-5 text-content-contrast sm:px-6">
          <div className="flex items-center gap-3">
            <span className={`flex size-12 shrink-0 items-center justify-center rounded-control ${toneClass} shadow-elevation-1`}>
              <Icon className={`size-6 ${iconClass}`} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-caption font-bold text-copper-light">{eyebrow}</p>
              <h1 className="mt-1 text-heading-3 font-black tracking-tight">{title}</h1>
            </div>
          </div>
        </header>

        <div className="space-y-5 p-4 sm:p-6">
          <p className="text-body leading-relaxed text-content-secondary">{description}</p>

          <dl className="rounded-control border border-border-primary bg-surface-secondary px-3">
            {rows.map((row) => (
              <div key={row.label} className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-border-primary/70 py-3 last:border-b-0">
                <dt className="text-caption text-content-tertiary">{row.label}</dt>
                <dd dir={row.ltr ? "ltr" : "auto"} className="ms-auto break-all text-body-sm font-black text-content-primary">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>

          <p className={`rounded-control border px-3.5 py-3 text-caption font-medium leading-relaxed ${noticeClass}`}>
            {notice}
          </p>

          <div className="flex flex-col gap-2.5 sm:flex-row">{actions}</div>
        </div>
      </div>
    </section>
  );
}
