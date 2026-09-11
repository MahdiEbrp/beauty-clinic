import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { PaymentProviderForm } from "@/components/payment-admin/PaymentProviderForm";
import { requirePermission } from "@/lib/auth/dal";
import { getPaymentProviderById } from "@/lib/payment/provider-service";
import { pageUrl } from "@/lib/site";

const ROUTE = "/dashboard/payment/providers";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "paymentProviderForm" });
  return {
    title: t("editHeading"),
    description: t("description"),
    alternates: { canonical: pageUrl(locale, ROUTE), languages: { fa: pageUrl("fa", ROUTE), en: pageUrl("en", ROUTE) } },
    robots: { index: false, follow: false },
  };
}

export default async function PaymentProviderEditPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  await requirePermission("payment.write");
  const { id } = await params;
  const provider = await getPaymentProviderById(id);
  if (!provider) notFound();
  return <PaymentProviderForm provider={provider} />;
}
