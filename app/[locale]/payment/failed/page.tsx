import type { Metadata } from "next";
import { CircleAlert } from "lucide-react";
import { getTranslations } from "next-intl/server";
import PaymentFailureActions from "@/components/payment/PaymentFailureActions";
import PaymentResultCard from "@/components/payment/PaymentResultCard";
import { getPaymentResultByAuthority, retryTokenFor } from "@/lib/payment/booking-checkout";
import { formatNumber } from "@/lib/services/format";

type PageProps = { params: Promise<{ locale: string }>; searchParams: Promise<{ authority?: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "paymentResult" });
  return { title: t("failure.metaTitle"), description: t("failure.metaDescription"), robots: { index: false, follow: false } };
}

export default async function PaymentFailedPage({ searchParams }: PageProps) {
  const { authority } = await searchParams;
  const t = await getTranslations("paymentResult");
  const transaction = authority ? await getPaymentResultByAuthority(authority) : null;
  const amount = transaction ? `${formatNumber(Number(transaction.amount))} ${transaction.currency}` : t("unknownValue");
  // eslint-disable-next-line react-hooks/purity -- server render: the hold window must reflect the request-time clock
  const remainingMinutes = transaction?.expiresAt ? Math.max(0, Math.ceil((transaction.expiresAt.getTime() - Date.now()) / 60_000)) : 0;
  const retryToken = transaction ? retryTokenFor(transaction) : null;

  return (
    <PaymentResultCard
      icon={CircleAlert}
      tone="failure"
      eyebrow={t("failure.eyebrow")}
      title={t("failure.title")}
      description={transaction?.status === "verified" ? t("failure.latePayment") : t("failure.description")}
      rows={[
        { label: t("labels.bookingReference"), value: transaction?.bookingGroupRef ?? t("unknownValue"), ltr: true },
        { label: t("labels.deposit"), value: amount },
        { label: t("labels.hold"), value: retryToken ? t("failure.minutes", { count: remainingMinutes }) : t("failure.expired") },
      ]}
      notice={retryToken ? t("failure.retryNotice") : t("failure.expiredNotice")}
      actions={<PaymentFailureActions retryToken={retryToken} />}
    />
  );
}
