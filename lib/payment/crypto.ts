import "server-only";

import { decryptSecret, encryptSecret } from "@/lib/auth/encryption";
import type { PaymentProviderKind } from "@/src/db/schema";

export type PaymentProviderCredentials = {
  sandbox?: boolean;
  terminalId?: string;
  accessToken?: string;
};

export type DecryptedPaymentProvider = {
  id: string;
  name: string;
  kind: PaymentProviderKind;
  merchantId: string;
  apiUrl: string;
  credentials: PaymentProviderCredentials;
  callbackUrl: string | null;
  isActive: boolean;
  isDefault: boolean;
  healthStatus: "unknown" | "healthy" | "unhealthy";
  lastHealthCheckedAt: Date | null;
  lastHealthError: string | null;
};

export function encryptPaymentProviderSecret(input: {
  merchantId: string;
  apiUrl: string;
  credentials?: PaymentProviderCredentials;
}): {
  merchantIdEncrypted: string;
  apiUrlEncrypted: string;
  settingsEncrypted: string;
  merchantLast4: string;
} {
  const merchantId = input.merchantId.trim();
  return {
    merchantIdEncrypted: encryptSecret(merchantId),
    apiUrlEncrypted: encryptSecret(input.apiUrl.trim()),
    settingsEncrypted: encryptSecret(JSON.stringify(input.credentials ?? {})),
    merchantLast4: merchantId.slice(-4),
  };
}

export function decryptPaymentProviderSecret(row: {
  id: string;
  name: string;
  kind: PaymentProviderKind;
  merchantIdEncrypted: string;
  apiUrlEncrypted: string;
  settingsEncrypted: string;
  callbackUrl: string | null;
  isActive: boolean;
  isDefault: boolean;
  healthStatus: "unknown" | "healthy" | "unhealthy";
  lastHealthCheckedAt: Date | null;
  lastHealthError: string | null;
}): DecryptedPaymentProvider {
  const raw = JSON.parse(decryptSecret(row.settingsEncrypted)) as unknown;
  const credentials = isCredentials(raw) ? raw : {};
  return {
    id: row.id,
    name: row.name,
    kind: row.kind,
    merchantId: decryptSecret(row.merchantIdEncrypted),
    apiUrl: decryptSecret(row.apiUrlEncrypted),
    credentials,
    callbackUrl: row.callbackUrl,
    isActive: row.isActive,
    isDefault: row.isDefault,
    healthStatus: row.healthStatus,
    lastHealthCheckedAt: row.lastHealthCheckedAt,
    lastHealthError: row.lastHealthError,
  };
}

function isCredentials(v: unknown): v is PaymentProviderCredentials {
  if (!v || typeof v !== "object" || Array.isArray(v)) return false;
  const r = v as Record<string, unknown>;
  return (
    (r.sandbox === undefined || typeof r.sandbox === "boolean") &&
    (r.terminalId === undefined || typeof r.terminalId === "string") &&
    (r.accessToken === undefined || typeof r.accessToken === "string")
  );
}
