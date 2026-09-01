import { and, count, desc, eq } from "drizzle-orm";

import { decryptSecret, encryptSecret } from "@/lib/auth/encryption";
import { createSmsProviderAdapter } from "@/lib/sms/providers";
import { hashRecipient, maskIranianPhone } from "@/lib/sms/phone";
import { loadProvider } from "./provider-diagnostics-service";
import { db } from "@/src/db";
import { smsProviders, smsReceivedMessages } from "@/src/db/schema";

export type AdminSmsReceived = {
  id: string;
  providerName: string | null;
  line: string;
  mobileMasked: string;
  message: string;
  receivedAt: Date | null;
  createdAt: Date;
};

export type ListSmsReceivedResult = {
  items: AdminSmsReceived[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

/**
 * Pull the latest received messages from the provider and persist them. SMS.ir
 * marks messages read after this call, so it is one-time per message; the
 * provider (providerId, receiveReturnId) pair de-duplicates replays.
 */
export async function refreshReceivedMessages(
  providerId: string,
): Promise<number> {
  const provider = await loadProvider(providerId);
  const adapter = createSmsProviderAdapter(provider);
  if (!adapter.receiveLatest) return 0;
  const received = await adapter.receiveLatest(100);
  if (received.length === 0) return 0;

  let stored = 0;
  for (const item of received) {
    if (!item.receiveReturnId || !item.messageText) continue;
    const rows = await db
      .insert(smsReceivedMessages)
      .values({
        providerId: provider.id,
        receiveReturnId: item.receiveReturnId,
        number: item.number,
        mobileEncrypted: encryptSecret(item.mobile),
        mobileHash: hashRecipient(item.mobile),
        messageEncrypted: encryptSecret(item.messageText),
        receivedAt: item.receivedDateTime
          ? new Date(item.receivedDateTime * 1000)
          : null,
      })
      .onConflictDoNothing()
      .returning({ id: smsReceivedMessages.id });
    stored += rows.length;
  }
  return stored;
}

export async function listReceivedMessages(options: {
  page: number;
  perPage: number;
  providerId?: string;
}): Promise<ListSmsReceivedResult> {
  const conditions = [];
  if (options.providerId) {
    conditions.push(eq(smsReceivedMessages.providerId, options.providerId));
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const [countRow] = await db
    .select({ value: count() })
    .from(smsReceivedMessages)
    .where(where);
  const total = Number(countRow?.value ?? 0);
  const rows = await db
    .select({
      id: smsReceivedMessages.id,
      providerName: smsProviders.name,
      line: smsReceivedMessages.number,
      mobileEncrypted: smsReceivedMessages.mobileEncrypted,
      messageEncrypted: smsReceivedMessages.messageEncrypted,
      receivedAt: smsReceivedMessages.receivedAt,
      createdAt: smsReceivedMessages.createdAt,
    })
    .from(smsReceivedMessages)
    .leftJoin(smsProviders, eq(smsProviders.id, smsReceivedMessages.providerId))
    .where(where)
    .orderBy(desc(smsReceivedMessages.receivedAt), desc(smsReceivedMessages.createdAt))
    .limit(options.perPage)
    .offset((options.page - 1) * options.perPage);

  return {
    items: rows.map((row) => ({
      id: row.id,
      providerName: row.providerName ?? null,
      line: row.line,
      mobileMasked: maskIranianPhone(decryptSecret(row.mobileEncrypted)),
      message: decryptSecret(row.messageEncrypted),
      receivedAt: row.receivedAt,
      createdAt: row.createdAt,
    })),
    total,
    page: options.page,
    perPage: options.perPage,
    totalPages: Math.ceil(total / options.perPage),
  };
}
