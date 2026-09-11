import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PaymentReportsContent } from "@/components/payment-admin/PaymentReportsContent";
import { requirePermission } from "@/lib/auth/dal";
import { pageUrl } from "@/lib/site";

const ROUTE = "/dashboard/payment/transactions";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "paymentReports" });
  return {
    title: t("heading"),
    description: t("description"),
    alternates: { canonical: pageUrl(locale, ROUTE), languages: { fa: pageUrl("fa", ROUTE), en: pageUrl("en", ROUTE) } },
    robots: { index: false, follow: false },
  };
}

export default async function PaymentTransactionsPage() {
  await requirePermission("payment.read");
  return <PaymentReportsContent />;
}
