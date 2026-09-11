import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PaymentSendContent } from "@/components/payment-admin/PaymentSendContent";
import { requirePermission } from "@/lib/auth/dal";
import { getPaymentComposeDatasets } from "@/lib/payment/report-service";
import { pageUrl } from "@/lib/site";

const ROUTE = "/dashboard/payment/checkout";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "paymentSend" });
  return {
    title: t("heading"),
    description: t("description"),
    alternates: { canonical: pageUrl(locale, ROUTE), languages: { fa: pageUrl("fa", ROUTE), en: pageUrl("en", ROUTE) } },
    robots: { index: false, follow: false },
  };
}

export default async function PaymentCheckoutPage() {
  await requirePermission("payment.send");
  const { providerItems } = await getPaymentComposeDatasets();
  return <PaymentSendContent providerItems={providerItems} />;
}
