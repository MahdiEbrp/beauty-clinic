import "server-only";

import { decryptSecret, encryptSecret } from "@/lib/auth/encryption";
import type { EmailEncryption, EmailProviderKind } from "@/src/db/schema";
import { hashRecipient, maskEmail, normalizeEmail } from "./email";

export type DecryptedEmailProvider = {
  id: string;
  name: string;
  kind: EmailProviderKind;
  host: string;
  port: number;
  username: string;
  password: string;
  encryption: EmailEncryption;
  fromEmail: string | null;
  fromName: string | null;
  isActive: boolean;
  isDefault: boolean;
  healthStatus: "unknown" | "healthy" | "unhealthy";
  lastHealthCheckedAt: Date | null;
  lastHealthError: string | null;
};

export function encryptProviderSecret(input: {
  host: string;
  port: number;
  username: string;
  password: string;
}): {
  hostEncrypted: string;
  portEncrypted: string;
  usernameEncrypted: string;
  passwordEncrypted: string;
  passwordLast4: string;
} {
  const password = input.password.trim();
  return {
    hostEncrypted: encryptSecret(input.host.trim()),
    portEncrypted: encryptSecret(String(input.port)),
    usernameEncrypted: encryptSecret(input.username.trim()),
    passwordEncrypted: encryptSecret(password),
    passwordLast4: password.slice(-4),
  };
}

export function decryptProviderSecret(row: {
  id: string;
  name: string;
  kind: EmailProviderKind;
  hostEncrypted: string;
  portEncrypted: string;
  usernameEncrypted: string;
  passwordEncrypted: string;
  encryption: EmailEncryption;
  fromEmail: string | null;
  fromName: string | null;
  isActive: boolean;
  isDefault: boolean;
  healthStatus: "unknown" | "healthy" | "unhealthy";
  lastHealthCheckedAt: Date | null;
  lastHealthError: string | null;
}): DecryptedEmailProvider {
  return {
    id: row.id,
    name: row.name,
    kind: row.kind,
    host: decryptSecret(row.hostEncrypted),
    port: Number(decryptSecret(row.portEncrypted)),
    username: decryptSecret(row.usernameEncrypted),
    password: decryptSecret(row.passwordEncrypted),
    encryption: row.encryption,
    fromEmail: row.fromEmail,
    fromName: row.fromName,
    isActive: row.isActive,
    isDefault: row.isDefault,
    healthStatus: row.healthStatus,
    lastHealthCheckedAt: row.lastHealthCheckedAt,
    lastHealthError: row.lastHealthError,
  };
}

export function encryptMessageContent(
  recipient: string,
  subject: string,
  body: string,
): {
  recipientEncrypted: string;
  recipientHash: string;
  recipientMasked: string;
  subjectEncrypted: string;
  bodyEncrypted: string;
} {
  const normalized = normalizeEmail(recipient);
  if (!normalized) throw new Error("Invalid email address");
  return {
    recipientEncrypted: encryptSecret(normalized),
    recipientHash: hashRecipient(normalized),
    recipientMasked: maskEmail(normalized),
    subjectEncrypted: encryptSecret(subject),
    bodyEncrypted: encryptSecret(body),
  };
}

export function decryptMessageContent(row: {
  recipientEncrypted: string;
  subjectEncrypted: string;
  bodyEncrypted: string;
}): { recipient: string; subject: string; body: string } {
  return {
    recipient: decryptSecret(row.recipientEncrypted),
    subject: decryptSecret(row.subjectEncrypted),
    body: decryptSecret(row.bodyEncrypted),
  };
}