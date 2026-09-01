import { createHmac } from "node:crypto";

import { env } from "@/lib/env";

const EMAIL_PATTERN = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;

/** Normalizes an email address to lowercase, or null when invalid. */
export function normalizeEmail(value: string): string | null {
  const normalized = value.trim().toLowerCase();
  if (normalized.length > 254 || !EMAIL_PATTERN.test(normalized)) return null;
  const [local, domain] = normalized.split("@") as [string, string];
  const localPart = local.replace(/\.(?=.*\.)/g, "").replace(/\.$/, "");
  if (domain.startsWith("-") || domain.endsWith("-")) return null;
  return `${localPart}@${domain}`;
}

/** Privacy-preserving masked email (e.g. `jo••••@gmail.com`). */
export function maskEmail(value: string): string {
  const normalized = normalizeEmail(value) ?? value.trim().toLowerCase();
  const atIndex = normalized.indexOf("@");
  if (atIndex <= 1) return "••••";
  const local = normalized.slice(0, atIndex);
  const domain = normalized.slice(atIndex);
  return `${local.slice(0, 2)}••••${domain}`;
}

/** Deterministic keyed hash for privacy-preserving recipient filtering. */
export function hashRecipient(value: string): string {
  const normalized = normalizeEmail(value) ?? value.trim().toLowerCase();
  return createHmac("sha256", Buffer.from(env.ENCRYPTION_KEY, "hex"))
    .update(normalized)
    .digest("hex");
}

export function normalizeRecipients(values: readonly string[]): {
  recipients: string[];
  invalid: string[];
  duplicates: string[];
} {
  const recipients: string[] = [];
  const invalid: string[] = [];
  const duplicates: string[] = [];
  const seen = new Set<string>();

  for (const value of values) {
    const normalized = normalizeEmail(value);
    if (!normalized) {
      invalid.push(value);
      continue;
    }
    if (seen.has(normalized)) {
      duplicates.push(normalized);
      continue;
    }
    seen.add(normalized);
    recipients.push(normalized);
  }

  return { recipients, invalid, duplicates };
}