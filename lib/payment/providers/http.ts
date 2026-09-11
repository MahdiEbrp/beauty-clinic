import { PAYMENT_ERROR_CODES, PAYMENT_ERROR_MESSAGES, PAYMENT_NETWORK } from "../constants";
import { PaymentProviderError } from "./types";

export type ProviderHttpResponse = {
  statusCode: number;
  body: unknown;
  durationMs: number;
};

const RETRYABLE = new Set([408, 425, 429, 500, 502, 503, 504]);
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
const LOCAL_SUFFIX = ".local";

export async function requestPaymentProvider(
  url: string,
  init: RequestInit,
  options?: { timeoutMs?: number; maxAttempts?: number },
): Promise<ProviderHttpResponse> {
  assertSafeUrl(url);
  const timeoutMs = options?.timeoutMs ?? PAYMENT_NETWORK.requestTimeoutMs;
  const maxAttempts = options?.maxAttempts ?? PAYMENT_NETWORK.maxAttempts;
  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const startedAt = Date.now();
    try {
      const response = await fetch(url, { ...init, signal: controller.signal, cache: "no-store" });
      const body = await readBody(response);
      const result = { statusCode: response.status, body, durationMs: Date.now() - startedAt };
      if (response.ok) return result;
      const retryable = RETRYABLE.has(response.status);
      if (!retryable || attempt === maxAttempts - 1) {
        throw new PaymentProviderError(errorMessage(response, body), PAYMENT_ERROR_CODES.providerHttpError, response.status, retryable);
      }
      lastError = new PaymentProviderError(PAYMENT_ERROR_MESSAGES.verifyFailed, PAYMENT_ERROR_CODES.providerHttpError, response.status, true);
    } catch (error) {
      lastError = error;
      if (error instanceof PaymentProviderError && !error.retryable) throw error;
      if (attempt === maxAttempts - 1) break;
    } finally {
      clearTimeout(timeout);
    }
    await wait(PAYMENT_NETWORK.retryDelayMs * 2 ** attempt);
  }
  if (lastError instanceof DOMException && lastError.name === "AbortError") {
    throw new PaymentProviderError(PAYMENT_ERROR_MESSAGES.verifyFailed, PAYMENT_ERROR_CODES.providerTimeout, undefined, true);
  }
  if (lastError instanceof PaymentProviderError) throw lastError;
  throw new PaymentProviderError(PAYMENT_ERROR_MESSAGES.verifyFailed, PAYMENT_ERROR_CODES.providerHttpError, undefined, true);
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text.slice(0, 2000);
  }
}

function errorMessage(response: Response, body: unknown): string {
  const rec = body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : undefined;
  const msg = rec?.message ?? rec?.errors;
  if (typeof msg === "string" && msg.trim()) return `${msg.trim()} (HTTP ${response.status})`;
  if (Array.isArray(msg) && msg.length) return `${String(msg[0])} (HTTP ${response.status})`;
  return PAYMENT_ERROR_MESSAGES.verifyFailed;
}

function assertSafeUrl(rawUrl: string): void {
  const parsed = new URL(rawUrl);
  const local = LOCAL_HOSTS.has(parsed.hostname) || parsed.hostname.endsWith(LOCAL_SUFFIX);
  if (parsed.protocol !== "https:" && !(local && process.env.NODE_ENV !== "production")) {
    throw new PaymentProviderError(PAYMENT_ERROR_MESSAGES.unsafeProviderUrl, PAYMENT_ERROR_CODES.unsafeProviderUrl, undefined, false);
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
