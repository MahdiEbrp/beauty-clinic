import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PaymentHub } from "@/components/payment-admin/PaymentHub";
import { requirePermission } from "@/lib/auth/dal";
import { getPaymentOverview } from "@/lib/payment/report-service";
import { pageUrl } from "@/lib/site";

const ROUTE = "/dashboard/payment";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "paymentAdmin" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: { canonical: pageUrl(locale, ROUTE), languages: { fa: pageUrl("fa", ROUTE), en: pageUrl("en", ROUTE) } },
    robots: { index: false, follow: false },
  };
}

export default async function PaymentDashboardPage() {
  await requirePermission("payment.read");
  const overview = await getPaymentOverview();
  return <PaymentHub overview={overview} />;
}
