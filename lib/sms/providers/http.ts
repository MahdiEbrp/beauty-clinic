import { SmsProviderError } from "./types";
import {
  SMS_ERROR_CODES,
  SMS_ERROR_MESSAGES,
  SMS_HTTP_RETRYABLE_STATUS_CODES,
  SMS_LOCAL_HOSTNAMES,
  SMS_LOCAL_HOST_SUFFIX,
  SMS_NETWORK,
} from "../constants";

export type ProviderHttpResponse = {
  statusCode: number;
  body: unknown;
  durationMs: number;
};

export async function requestProvider(
  url: string,
  init: RequestInit,
  options?: { timeoutMs?: number; maxAttempts?: number },
): Promise<ProviderHttpResponse> {
  assertSafeProviderUrl(url);
  const timeoutMs = options?.timeoutMs ?? SMS_NETWORK.requestTimeoutMs;
  const maxAttempts = options?.maxAttempts ?? SMS_NETWORK.maxAttempts;
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const startedAt = Date.now();
    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
        cache: "no-store",
      });
      const body = await readResponseBody(response);
      const result = {
        statusCode: response.status,
        body,
        durationMs: Date.now() - startedAt,
      };
      if (response.ok) return result;

      const retryable = SMS_HTTP_RETRYABLE_STATUS_CODES.has(response.status);
      if (!retryable || attempt === maxAttempts - 1) {
        throw new SmsProviderError(
          providerErrorMessage(response, body),
          SMS_ERROR_CODES.providerHttpError,
          response.status,
          retryable,
        );
      }
      lastError = new SmsProviderError(
        SMS_ERROR_MESSAGES.providerTemporaryUnavailable,
        SMS_ERROR_CODES.providerTemporaryError,
        response.status,
        true,
      );
    } catch (error) {
      lastError = error;
      if (error instanceof SmsProviderError && !error.retryable) throw error;
      if (attempt === maxAttempts - 1) break;
    } finally {
      clearTimeout(timeout);
    }

    await wait(SMS_NETWORK.retryDelayMs * 2 ** attempt);
  }

  if (lastError instanceof DOMException && lastError.name === "AbortError") {
    throw new SmsProviderError(
      SMS_ERROR_MESSAGES.providerTimeout,
      SMS_ERROR_CODES.providerTimeout,
      undefined,
      true,
    );
  }
  if (lastError instanceof SmsProviderError) throw lastError;
  throw new SmsProviderError(
    SMS_ERROR_MESSAGES.providerNetworkError,
    SMS_ERROR_CODES.providerNetworkError,
    undefined,
    true,
  );
}

async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text.slice(0, SMS_NETWORK.responseBodyMaxChars);
  }
}

/**
 * Prefer the provider's own description in the error body (e.g. SMS.ir returns
 * `{ status, message, data }`) over the generic rejection text, so failures
 * like an invalid line number surface in logs instead of a blanket message.
 */
function providerErrorMessage(response: Response, body: unknown): string {
  const record = body && typeof body === "object" && !Array.isArray(body)
    ? (body as Record<string, unknown>)
    : undefined;
  const providerText = record?.message;
  const text = typeof providerText === "string" && providerText.trim()
    ? providerText.trim()
    : "";
  if (text) return `${text} (HTTP ${response.status})`;
  return SMS_ERROR_MESSAGES.providerHttpRejected;
}

function assertSafeProviderUrl(rawUrl: string): void {
  const parsed = new URL(rawUrl);
  const localHost =
    SMS_LOCAL_HOSTNAMES.has(parsed.hostname) ||
    parsed.hostname.endsWith(SMS_LOCAL_HOST_SUFFIX);
  if (parsed.protocol !== "https:" && !(localHost && process.env.NODE_ENV !== "production")) {
    throw new SmsProviderError(
      SMS_ERROR_MESSAGES.unsafeProviderUrl,
      SMS_ERROR_CODES.unsafeProviderUrl,
      undefined,
      false,
    );
  }
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
