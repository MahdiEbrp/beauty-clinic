import type { AdminPaymentProvider } from "@/lib/payment/provider-service";
import type { PaymentHealthStatus, PaymentProviderKind, PaymentTransactionStatus } from "@/src/db/schema";

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

/** JSON-safe (transport) shape for the payment transactions admin list. */
export type PaymentTransactionAdmin = {
  id: string;
  bookingGroupRef: string;
  amount: string;
  currency: string;
  description: string | null;
  status: PaymentTransactionStatus;
  providerId: string | null;
  providerName: string | null;
  authority: string | null;
  refId: string | null;
  paymentUrl: string | null;
  cardPan: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  verifiedAt: string | null;
  expiresAt: string | null;
};

export type PaymentTransactionListRow = {
  id: string;
  bookingGroupRef: string;
  amount: string;
  currency: string;
  description: string | null;
  status: PaymentTransactionStatus;
  providerId: string | null;
  providerName: string | null;
  authority: string | null;
  refId: string | null;
  paymentUrl: string | null;
  cardPan: string | null;
  errorMessage: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  verifiedAt: Date | string | null;
  expiresAt: Date | string | null;
};

export function toPaymentTransactionAdmin(
  row: PaymentTransactionListRow,
): PaymentTransactionAdmin {
  return {
    id: row.id,
    bookingGroupRef: row.bookingGroupRef,
    amount: row.amount,
    currency: row.currency,
    description: row.description,
    status: row.status,
    providerId: row.providerId,
    providerName: row.providerName,
    authority: row.authority,
    refId: row.refId,
    paymentUrl: row.paymentUrl,
    cardPan: row.cardPan,
    errorMessage: row.errorMessage,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
    verifiedAt: toIsoNullable(row.verifiedAt),
    expiresAt: toIsoNullable(row.expiresAt),
  };
}

export function mapPaymentTransactions(
  rows: PaymentTransactionListRow[],
): PaymentTransactionAdmin[] {
  return rows.map(toPaymentTransactionAdmin);
}

function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : String(value);
}

function toIsoNullable(value: Date | string | null): string | null {
  return value == null ? null : toIso(value);
}