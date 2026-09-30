import {
  EMAIL_ERROR_CODES,
  EMAIL_ERROR_MESSAGES,
  EMAIL_HTTP_STATUS,
  EMAIL_LOCAL_HOSTNAMES,
  EMAIL_LOCAL_HOST_SUFFIX,
  EMAIL_NETWORK,
} from "@/lib/email/constants";
import { logInfo } from "@/lib/log";
import { EmailProviderError } from "./types";
import type {
  EmailProviderAdapter,
  EmailProviderConfig,
  EmailSendInput,
  EmailSendResult,
} from "./types";

/**
 * Liara transactional mail service adapter (HTTP API). The Liara control panel
 * exposes a per-server endpoint rather than SMTP, so a provider row maps its
 * fields as follows: `host` = base service URL, `username` = mail server id,
 * `password` = API token. Sends are issued one recipient at a time because the
 * API accepts a single `to` address per request.
 *
 * API reference: https://mail-service.liara.ir/api/v1/mails
 */
const LIARA = {
  tag: "transactional",
  messagesSuffix: "/messages",
} as const;

export function createLiaraAdapter(config: EmailProviderConfig): EmailProviderAdapter {
  return {
    send: (input) => sendViaLiara(config, input),
  };
}

async function sendViaLiara(
  config: EmailProviderConfig,
  input: EmailSendInput,
): Promise<EmailSendResult> {
  const from = (input.fromEmail ?? config.fromEmail ?? "").trim();
  if (!from) {
    throw new EmailProviderError(
      EMAIL_ERROR_MESSAGES.providerSmtpRejected,
      EMAIL_ERROR_CODES.providerRejected,
    );
  }

  const endpoint = resolveEndpoint(config.host, config.username);
  const accepted: EmailSendResult["accepted"] = [];
  const rejected: EmailSendResult["rejected"] = [];
  let statusCode: number = EMAIL_HTTP_STATUS.badGateway;

  for (const recipient of input.recipients) {
    try {
      const response = await postMessage(config, endpoint, {
        to: recipient,
        from,
        subject: input.subject,
        text: input.templateType === "html" ? stripTags(input.message) : input.message,
        html: input.templateType === "html" ? input.message : undefined,
      });
      statusCode = response.statusCode;
      accepted.push({ recipient, providerStatus: "sent" });
    } catch (error) {
      if (error instanceof EmailProviderError && error.statusCode !== undefined) {
        statusCode = error.statusCode;
        rejected.push({ recipient, code: error.code, message: error.message });
        continue;
      }
      throw error;
    }
  }

  return {
    accepted,
    rejected,
    statusCode,
    providerStatus:
      rejected.length > 0 ? "Some recipients were rejected by Liara." : "Accepted by Liara.",
  };
}

async function postMessage(
  config: EmailProviderConfig,
  endpoint: string,
  payload: {
    to: string;
    from: string;
    subject: string;
    text: string;
    html?: string;
  },
): Promise<{ statusCode: number }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), EMAIL_NETWORK.connectTimeoutMs);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.password}`,
        "Content-Type": "application/json",
        "x-liara-tag": LIARA.tag,
      },
      body: JSON.stringify({
        to: payload.to,
        from: payload.from,
        subject: payload.subject,
        text: payload.text,
        ...(payload.html !== undefined ? { html: payload.html } : {}),
        attachments: [],
      }),
      signal: controller.signal,
      cache: "no-store",
    });
    const body = await readBody(response);
    if (!response.ok) {
      throw new EmailProviderError(
        providerErrorMessage(response.status, body),
        EMAIL_ERROR_CODES.providerRejected,
        response.status,
      );
    }
    logInfo("email.liara.sent", {
      recipient: payload.to,
      statusCode: response.status,
    });
    return { statusCode: response.status };
  } catch (error) {
    if (error instanceof EmailProviderError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new EmailProviderError(
        EMAIL_ERROR_MESSAGES.providerTimeout,
        EMAIL_ERROR_CODES.providerTimeout,
        undefined,
        true,
      );
    }
    throw new EmailProviderError(
      EMAIL_ERROR_MESSAGES.providerNetworkError,
      EMAIL_ERROR_CODES.providerNetworkError,
      undefined,
      true,
    );
  } finally {
    clearTimeout(timeout);
  }
}

/** Accept a base URL, a full endpoint, or a URL containing `/messages`. */
export function resolveEndpoint(baseUrl: string, serverId: string): string {
  const base = baseUrl.trim().replace(/\/+$/, "");
  const id = serverId.trim();
  if (!base || !id) {
    throw new EmailProviderError(
      EMAIL_ERROR_MESSAGES.providerSmtpRejected,
      EMAIL_ERROR_CODES.providerRejected,
    );
  }
  assertSafeEndpoint(base);
  if (base.endsWith(`/${id}${LIARA.messagesSuffix}`)) return base;
  if (base.endsWith(LIARA.messagesSuffix)) {
    return `${base.slice(0, -LIARA.messagesSuffix.length)}/${id}${LIARA.messagesSuffix}`;
  }
  return `${base}/${id}${LIARA.messagesSuffix}`;
}

function assertSafeEndpoint(rawUrl: string): void {
  const parsed = new URL(rawUrl);
  const localHost =
    EMAIL_LOCAL_HOSTNAMES.has(parsed.hostname) ||
    parsed.hostname.endsWith(EMAIL_LOCAL_HOST_SUFFIX);
  if (parsed.protocol !== "https:" && !(localHost && process.env.NODE_ENV !== "production")) {
    throw new EmailProviderError(
      EMAIL_ERROR_MESSAGES.unsafeProviderHost,
      EMAIL_ERROR_CODES.unsafeProviderHost,
    );
  }
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text().catch(() => "");
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text.slice(0, EMAIL_NETWORK.responseBodyMaxChars);
  }
}

function providerErrorMessage(status: number, body: unknown): string {
  const record =
    body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : undefined;
  const providerText = record?.message;
  const text = typeof providerText === "string" && providerText.trim() ? providerText.trim() : "";
  if (text) return `${text} (HTTP ${status})`;
  return EMAIL_ERROR_MESSAGES.providerSmtpRejected;
}

/** Liara accepts a `text` fallback alongside `html`; derive it from the markup. */
function stripTags(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
