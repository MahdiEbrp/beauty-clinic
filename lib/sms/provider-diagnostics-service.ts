import { eq } from "drizzle-orm";

import { ApiError } from "@/lib/api/errors";
import { decryptProviderSecret } from "@/lib/sms/crypto";
import { SMS_ERROR_CODES, SMS_ERROR_MESSAGES } from "@/lib/sms/constants";
import { createSmsProviderAdapter, SmsProviderError } from "@/lib/sms/providers";
import { db } from "@/src/db";
import { smsMessages } from "@/src/db/schema";
import { getSmsProviderRow } from "./provider-service";

export type SmsProviderDiagnostics = {
  providerId: string;
  kind: string;
  credit: number | null;
  lines: string[];
};

/**
 * Read live account diagnostics (credit and active lines) from the provider.
 * Only providers whose adapter implements the diagnostics surface respond; the
 * result is null for adapters without support.
 */
export async function getSmsProviderDiagnostics(
  providerId: string,
): Promise<SmsProviderDiagnostics | null> {
  const provider = await loadProvider(providerId);
  const adapter = createSmsProviderAdapter(provider);
  if (!adapter.getCredit && !adapter.getLines) return null;
  const [credit, lines] = await Promise.all([
    adapter.getCredit?.() ?? Promise.resolve(null),
    adapter.getLines?.() ?? Promise.resolve([]),
  ]);
  return {
    providerId: provider.id,
    kind: provider.kind,
    credit,
    lines,
  };
}

/**
 * Reconcile one stored message with its provider delivery report and update the
 * local status. Returns the resolved status, or null when the provider has no
 * record for the message yet.
 */
export async function syncSmsMessageDelivery(
  messageId: string,
): Promise<"delivered" | "failed" | "sent" | "sending" | null> {
  const [message] = await db
    .select()
    .from(smsMessages)
    .where(eq(smsMessages.id, messageId));
  if (!message) {
    throw new ApiError(404, SMS_ERROR_CODES.messageNotFound, SMS_ERROR_MESSAGES.messageNotFound);
  }
  if (!message.providerMessageId || !message.providerId) return null;

  const provider = await loadProvider(message.providerId);
  const adapter = createSmsProviderAdapter(provider);
  if (!adapter.getMessage) return null;
  const report = await adapter.getMessage(message.providerMessageId);
  if (!report) return null;

  const status = deliveryStateToStatus(report.deliveryState);
  await db
    .update(smsMessages)
    .set({
      status,
      providerStatus: report.statusText ?? String(report.deliveryState),
      ...(status === "delivered" ? { deliveredAt: new Date() } : {}),
      updatedAt: new Date(),
    })
    .where(eq(smsMessages.id, messageId));
  return status;
}

export async function loadProvider(providerId: string) {
  const row = await getSmsProviderRow(providerId);
  if (!row) {
    throw new ApiError(404, SMS_ERROR_CODES.providerNotFound, SMS_ERROR_MESSAGES.providerNotFound);
  }
  return decryptProviderSecret(row);
}

export function deliveryStateToStatus(
  deliveryState: number,
): "delivered" | "failed" | "sent" | "sending" {
  switch (deliveryState) {
    case 1:
      return "delivered";
    case 2:
    case 4:
    case 6:
    case 7:
      return "failed";
    case 3:
    case 5:
      return "sent";
    default:
      return "sending";
  }
}

export function toProviderError(error: unknown): { code: string; message: string } {
  if (error instanceof SmsProviderError) {
    return { code: error.code, message: error.message };
  }
  return {
    code: SMS_ERROR_CODES.providerNetworkError,
    message: SMS_ERROR_MESSAGES.providerNetworkError,
  };
}
