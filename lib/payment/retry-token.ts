import { createHmac, timingSafeEqual } from "node:crypto";

type RetryPayload = { id: string; exp: number };

export function createPaymentRetryToken(transactionId: string, expiresAt: Date): string {
  const payload = Buffer.from(JSON.stringify({ id: transactionId, exp: expiresAt.getTime() }), "utf8").toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readPaymentRetryToken(token: string): RetryPayload | null {
  const [payload, signature, ...rest] = token.split(".");
  if (!payload || !signature || rest.length > 0 || !safeEqual(signature, sign(payload))) return null;
  try {
    const value = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as unknown;
    if (!isPayload(value) || value.exp <= Date.now()) return null;
    return value;
  } catch {
    return null;
  }
}

function sign(payload: string): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET is required for payment retry tokens.");
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function isPayload(value: unknown): value is RetryPayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return typeof record.id === "string" && /^[0-9a-f-]{36}$/i.test(record.id) && typeof record.exp === "number";
}
