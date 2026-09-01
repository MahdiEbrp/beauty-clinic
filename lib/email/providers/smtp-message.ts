import { randomBytes } from "node:crypto";

import { EMAIL_PROVIDER_SMTP } from "@/lib/email/constants";

const CRLF = EMAIL_PROVIDER_SMTP.lineBreak;

export function buildMessagePayload(
  from: string,
  recipients: string[],
  subject: string,
  body: string,
  html: boolean,
): string {
  const headers: string[] = [
    `From: ${from}`,
    `To: ${recipients.join(", ")}`,
    `Subject: ${encodeHeader(subject)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${cryptoRandomId()}@localhost>`,
    "MIME-Version: 1.0",
    `Content-Type: ${html ? "text/html" : "text/plain"}; charset=utf-8`,
    "Content-Transfer-Encoding: 8bit",
    "",
    dotEscape(body),
    ".",
  ];
  return headers.join(CRLF) + CRLF;
}

export function extractMessageId(text: string): string | undefined {
  const match =
    /(?:\s|<)?([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:\s|>)?/i.exec(
      text,
    );
  return match?.[1] ?? undefined;
}

function cryptoRandomId(): string {
  return randomBytes(16).toString("hex");
}

function encodeHeader(value: string): string {
  if (isAscii(value)) return value;
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

function isAscii(value: string): boolean {
  return /^[\x00-\x7F]*$/.test(value);
}

function dotEscape(value: string): string {
  return value.replace(/(^|[\r\n])\./g, "$1..");
}