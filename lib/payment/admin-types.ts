import type { AdminPaymentProvider } from "@/lib/payment/provider-service";
import type { PaymentHealthStatus, PaymentProviderKind } from "@/src/db/schema";

/** JSON-safe (transport) shape for the payment providers admin list. */
export type PaymentProviderAdmin = {
  id: string;
  name: string;
  kind: PaymentProviderKind;
  merchantLast4: string;
  isActive: boolean;
  isDefault: boolean;
  healthStatus: PaymentHealthStatus;
  lastHealthCheckedAt: string | null;
};

export function toPaymentProviderAdmin(
  row: AdminPaymentProvider,
): PaymentProviderAdmin {
  return {
    id: row.id,
    name: row.name,
    kind: row.kind,
    merchantLast4: row.merchantLast4,
    isActive: row.isActive,
    isDefault: row.isDefault,
    healthStatus: row.healthStatus,
    lastHealthCheckedAt: row.lastHealthCheckedAt
      ? row.lastHealthCheckedAt.toISOString()
      : null,
  };
}

export function mapPaymentProviders(
  rows: AdminPaymentProvider[],
): PaymentProviderAdmin[] {
  return rows.map(toPaymentProviderAdmin);
}