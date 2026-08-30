import { createHmac } from "node:crypto";

import { env } from "@/lib/env";

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

function toLatinDigits(value: string): string {
  return [...value]
    .map((character) => {
      const persianIndex = PERSIAN_DIGITS.indexOf(character);
      if (persianIndex >= 0) return String(persianIndex);
      const arabicIndex = ARABIC_DIGITS.indexOf(character);
      return arabicIndex >= 0 ? String(arabicIndex) : character;
    })
    .join("");
}

/** Normalizes Iranian mobile formats to +989xxxxxxxxx. */
export function normalizeIranianPhone(value: string): string | null {
  const compact = toLatinDigits(value).replace(/[\s().-]/g, "");
  let normalized = compact;
  if (normalized.startsWith("0098")) normalized = `+${normalized.slice(2)}`;
  else if (normalized.startsWith("98")) normalized = `+${normalized}`;
  else if (normalized.startsWith("09")) normalized = `+98${normalized.slice(1)}`;
  if (!/^\+989\d{9}$/.test(normalized)) return null;
  return normalized;
}

export function maskIranianPhone(value: string): string {
  const normalized = normalizeIranianPhone(value) ?? value;
  if (normalized.length < 8) return "••••";
  return `${normalized.slice(0, 3)}••••${normalized.slice(-4)}`;
}

/** Deterministic keyed hash for privacy-preserving recipient filtering. */
export function hashRecipient(value: string): string {
  const normalized = normalizeIranianPhone(value) ?? value.trim();
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
    const normalized = normalizeIranianPhone(value);
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
