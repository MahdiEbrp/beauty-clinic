import { EmailProviderError } from "./types";
import { sendSmtpMail } from "./smtp-client";
import type {
  EmailProviderAdapter,
  EmailProviderConfig,
  EmailSendInput,
  EmailSendResult,
} from "./types";

export function createSmtpAdapter(config: EmailProviderConfig): EmailProviderAdapter {
  return {
    send: (input) => sendSmtpAdapter(config, input),
  };
}

async function sendSmtpAdapter(
  config: EmailProviderConfig,
  input: EmailSendInput,
): Promise<EmailSendResult> {
  const from = formatSender(input.fromEmail ?? config.fromEmail ?? "", config);
  const result = await sendSmtpMail(
    {
      host: config.host,
      port: config.port,
      encryption: config.encryption,
      username: config.username,
      password: config.password,
    },
    {
      from,
      recipients: input.recipients,
      subject: input.subject,
      body: input.message,
      html: input.templateType === "html",
    },
  );
  return {
    accepted: result.accepted.map((row) => ({
      recipient: row.recipient,
      providerMessageId: result.messageId,
      providerStatus: "sent",
    })),
    rejected: result.rejected.map((row) => ({
      recipient: row.recipient,
      code: smtpCodeToErrorCode(row.code),
      message: row.message,
    })),
    statusCode: result.responseCode,
    ...(result.responseMessage ? { providerStatus: result.responseMessage } : {}),
  };
}

function formatSender(from: string, config: EmailProviderConfig): string {
  if (!config.fromName) return from;
  return `${encodeDisplayName(config.fromName)} <${from}>`;
}

function encodeDisplayName(value: string): string {
  if (/^[\x00-\x7F]*$/.test(value)) return value;
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

function smtpCodeToErrorCode(code: number): string {
  if (code === 550 || code === 553 || code === 551) return "PROVIDER_REJECTED";
  if (code >= 500 || code === 421) return "PROVIDER_SMTP_ERROR";
  return "PROVIDER_REJECTED";
}

export function toClientFailure(error: unknown): {
  code: string;
  message: string;
  statusCode?: number;
} {
  if (error instanceof EmailProviderError) {
    return { code: error.code, message: error.message, statusCode: error.statusCode };
  }
  return { code: "PROVIDER_NETWORK_ERROR", message: "Could not connect to the email provider." };
}