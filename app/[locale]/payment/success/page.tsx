import type { Metadata } from "next";
import { CheckCircle2, Home } from "lucide-react";
import { getTranslations } from "next-intl/server";
import PaymentResultCard from "@/components/payment/PaymentResultCard";
import PrintPaymentReceiptButton from "@/components/payment/PrintPaymentReceiptButton";
import { getPaymentResultByAuthority } from "@/lib/payment/booking-checkout";
import { formatNumber } from "@/lib/services/format";
import { Link } from "@/src/i18n/navigation";

type PageProps = { params: Promise<{ locale: string }>; searchParams: Promise<{ authority?: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "paymentResult" });
  return { title: t("success.metaTitle"), description: t("success.metaDescription"), robots: { index: false, follow: false } };
}

export default async function PaymentSuccessPage({ searchParams }: PageProps) {
  const { authority } = await searchParams;
  const t = await getTranslations("paymentResult");
  const transaction = authority ? await getPaymentResultByAuthority(authority) : null;
  const verified = transaction?.status === "verified";
  const amount = transaction ? `${formatNumber(Number(transaction.amount))} ${transaction.currency}` : t("unknownValue");

  return (
    <PaymentResultCard
      icon={CheckCircle2}
      tone="success"
      eyebrow={t("success.eyebrow")}
      title={verified ? t("success.title") : t("success.unavailableTitle")}
      description={verified ? t("success.description") : t("success.unavailableDescription")}
      rows={[
        { label: t("labels.bookingReference"), value: transaction?.bookingGroupRef ?? t("unknownValue"), ltr: true },
        { label: t("labels.paymentReference"), value: transaction?.refId ?? t("unknownValue"), ltr: true },
        { label: t("labels.deposit"), value: amount },
      ]}
      notice={t("success.notice")}
      actions={
        <>
          <PrintPaymentReceiptButton />
          <Link href="/" className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-control bg-accent px-4 text-body-sm font-black text-content-contrast shadow-elevation-1 transition-all hover:bg-accent-hover active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            <Home className="size-4 text-copper-light" aria-hidden="true" />
            {t("success.home")}
          </Link>
        </>
      }
    />
  );
}
