import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PaymentProviderForm } from "@/components/payment-admin/PaymentProviderForm";
import { requirePermission } from "@/lib/auth/dal";
import { pageUrl } from "@/lib/site";

const ROUTE = "/dashboard/payment/providers/add";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "paymentProviderForm" });
  return {
    title: t("heading"),
    description: t("description"),
    alternates: { canonical: pageUrl(locale, ROUTE), languages: { fa: pageUrl("fa", ROUTE), en: pageUrl("en", ROUTE) } },
    robots: { index: false, follow: false },
  };
}

export default async function PaymentProviderAddPage() {
  await requirePermission("payment.write");
  return <PaymentProviderForm />;
}
