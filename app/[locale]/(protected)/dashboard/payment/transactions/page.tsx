import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PaymentTransactionsListView } from "@/components/payment-admin/payment-transactions-view";
import { requirePermission } from "@/lib/auth/dal";
import { listPaymentTransactions } from "@/lib/payment/transaction-service";
import { mapPaymentTransactions } from "@/lib/payment/admin-types";
import { PAYMENT_LIMITS } from "@/lib/payment/constants";
import { pageUrl } from "@/lib/site";
import type { ListResult } from "@/components/admin-list/types";
import type { PaymentTransactionAdmin } from "@/lib/payment/admin-types";

const ROUTE = "/dashboard/payment/transactions";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "paymentTransactions" });
  return {
    title: t("heading"),
    description: t("description"),
    alternates: { canonical: pageUrl(locale, ROUTE), languages: { fa: pageUrl("fa", ROUTE), en: pageUrl("en", ROUTE) } },
    robots: { index: false, follow: false },
  };
}

export default async function PaymentTransactionsPage() {
  const session = await requirePermission("payment.read");
  const result = await listPaymentTransactions({
    page: 1,
    perPage: PAYMENT_LIMITS.transactionListPerPageDefault,
    status: "all",
  });
  const initialData: ListResult<PaymentTransactionAdmin> = {
    items: mapPaymentTransactions(result.items),
    total: result.total,
    perPage: result.perPage,
    totalPages: result.totalPages,
    page: result.page,
  };
  return <PaymentTransactionsListView user={session.user} initialData={initialData} />;
}