import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PaymentProvidersListView } from "@/components/payment-admin/payment-providers-view";
import { requirePermission } from "@/lib/auth/dal";
import { listPaymentProviders } from "@/lib/payment/provider-service";
import { mapPaymentProviders } from "@/lib/payment/admin-types";
import { pageUrl } from "@/lib/site";
import type { ListResult } from "@/components/admin-list/types";
import type { PaymentProviderAdmin } from "@/lib/payment/admin-types";

const ROUTE = "/dashboard/payment/providers";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "paymentProviderForm",
  });
  return {
    title: t("heading"),
    description: t("description"),
    alternates: {
      canonical: pageUrl(locale, ROUTE),
      languages: {
        fa: pageUrl("fa", ROUTE),
        en: pageUrl("en", ROUTE),
      },
    },
    robots: { index: false, follow: false },
  };
}

export default async function PaymentProvidersPage() {
  const session = await requirePermission("payment.read");
  const result = await listPaymentProviders({
    page: 1,
    perPage: 10,
    status: "all",
  });
  const initialData: ListResult<PaymentProviderAdmin> = {
    items: mapPaymentProviders(result.items),
    total: result.total,
    perPage: result.perPage,
    totalPages: result.totalPages,
    page: result.page,
  };
  return <PaymentProvidersListView user={session.user} initialData={initialData} />;
}