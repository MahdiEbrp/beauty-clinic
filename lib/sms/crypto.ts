import "server-only";

import { decryptSecret, encryptSecret } from "@/lib/auth/encryption";
import type { SmsProviderKind } from "@/src/db/schema";
import { hashRecipient, maskIranianPhone, normalizeIranianPhone } from "./phone";

export type SmsProviderCredentials = {
  apiKey?: string;
  username?: string;
  password?: string;
  authHeader?: string;
  authScheme?: "bearer" | "x-api-key" | "token" | "none";
  lineNumber?: string;
  payloadMode?: "standard" | "bulk";
};

export type DecryptedSmsProvider = {
  id: string;
  name: string;
  kind: SmsProviderKind;
  apiUrl: string;
  token: string;
  credentials: SmsProviderCredentials;
  sender: string | null;
  isActive: boolean;
  isDefault: boolean;
  healthStatus: "unknown" | "healthy" | "unhealthy";
  lastHealthCheckedAt: Date | null;
  lastHealthError: string | null;
};

export function encryptProviderSecret(input: {
  apiUrl: string;
  token: string;
  credentials?: SmsProviderCredentials;
}): {
  apiUrlEncrypted: string;
  tokenEncrypted: string;
  settingsEncrypted: string;
  tokenLast4: string;
} {
  const token = input.token.trim();
  return {
    apiUrlEncrypted: encryptSecret(input.apiUrl.trim()),
    tokenEncrypted: encryptSecret(token),
    settingsEncrypted: encryptSecret(JSON.stringify(input.credentials ?? {})),
    tokenLast4: token.slice(-4),
  };
}

export function decryptProviderSecret(row: {
  id: string;
  name: string;
  kind: SmsProviderKind;
  apiUrlEncrypted: string;
  tokenEncrypted: string;
  settingsEncrypted: string;
  sender: string | null;
  isActive: boolean;
  isDefault: boolean;
  healthStatus: "unknown" | "healthy" | "unhealthy";
  lastHealthCheckedAt: Date | null;
  lastHealthError: string | null;
}): DecryptedSmsProvider {
  const rawCredentials = JSON.parse(decryptSecret(row.settingsEncrypted)) as unknown;
  const credentials = isCredentials(rawCredentials) ? rawCredentials : {};
  return {
    id: row.id,
    name: row.name,
    kind: row.kind,
    apiUrl: decryptSecret(row.apiUrlEncrypted),
    token: decryptSecret(row.tokenEncrypted),
    credentials,
    sender: row.sender,
    isActive: row.isActive,
    isDefault: row.isDefault,
    healthStatus: row.healthStatus,
    lastHealthCheckedAt: row.lastHealthCheckedAt,
    lastHealthError: row.lastHealthError,
  };
}

export function encryptMessageContent(recipient: string, body: string): {
  recipientEncrypted: string;
  recipientHash: string;
  recipientMasked: string;
  bodyEncrypted: string;
} {
  const normalized = normalizeIranianPhone(recipient);
  if (!normalized) throw new Error("Invalid Iranian mobile number");
  return {
    recipientEncrypted: encryptSecret(normalized),
    recipientHash: hashRecipient(normalized),
    recipientMasked: maskIranianPhone(normalized),
    bodyEncrypted: encryptSecret(body),
  };
}

export function decryptMessageContent(row: {
  recipientEncrypted: string;
  bodyEncrypted: string;
}): { recipient: string; body: string } {
  return {
    recipient: decryptSecret(row.recipientEncrypted),
    body: decryptSecret(row.bodyEncrypted),
  };
}

function isCredentials(value: unknown): value is SmsProviderCredentials {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return (
    (record.authScheme === undefined ||
      record.authScheme === "bearer" ||
      record.authScheme === "x-api-key" ||
      record.authScheme === "token" ||
      record.authScheme === "none") &&
    (record.payloadMode === undefined ||
      record.payloadMode === "standard" ||
      record.payloadMode === "bulk")
  );
}
