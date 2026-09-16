import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { TransactionEditForm } from "@/components/payment-admin/TransactionEditForm";
import { requirePermission } from "@/lib/auth/dal";
import { getPaymentTransactionByIdWithProvider } from "@/lib/payment/transaction-service";
import { toPaymentTransactionAdmin } from "@/lib/payment/admin-types";
import { pageUrl } from "@/lib/site";

const ROUTE = "/dashboard/payment/transactions";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "paymentTransactionForm" });
  return {
    title: t("editHeading"),
    description: t("editDescription"),
    alternates: { canonical: pageUrl(locale, ROUTE), languages: { fa: pageUrl("fa", ROUTE), en: pageUrl("en", ROUTE) } },
    robots: { index: false, follow: false },
  };
}

export default async function PaymentTransactionEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("payment.write");
  const { id } = await params;
  const row = await getPaymentTransactionByIdWithProvider(id);
  if (!row) notFound();
  return <TransactionEditForm transaction={toPaymentTransactionAdmin(row)} />;
}