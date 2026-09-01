import { inArray, sql } from "drizzle-orm";

import { hashRecipient } from "@/lib/email/email";
import type { EmailAcceptedMessage } from "@/lib/email/providers";
import { db } from "@/src/db";
import { emailMessages } from "@/src/db/schema";

type InsertedMessage = { id: string; recipientHash: string };

export async function updateAcceptedEmailMessages(
  inserted: InsertedMessage[],
  accepted: EmailAcceptedMessage[],
  statusCode: number,
): Promise<void> {
  if (accepted.length === 0) return;
  const byHash = new Map(inserted.map((row) => [row.recipientHash, row]));
  const messageIds: string[] = [];
  const providerIdEntries: Array<{ id: string; value: string }> = [];
  const providerStatusEntries: Array<{ id: string; value: string }> = [];

  for (const item of accepted) {
    const row = byHash.get(hashRecipient(item.recipient));
    if (!row) continue;
    messageIds.push(row.id);
    if (item.providerMessageId) {
      providerIdEntries.push({ id: row.id, value: item.providerMessageId });
    }
    if (item.providerStatus) {
      providerStatusEntries.push({ id: row.id, value: item.providerStatus });
    }
  }
  if (messageIds.length === 0) return;

  await db
    .update(emailMessages)
    .set({
      status: "sent",
      providerResponseCode: statusCode,
      sentAt: new Date(),
      updatedAt: new Date(),
    })
    .where(inArray(emailMessages.id, messageIds));

  if (providerIdEntries.length > 0) {
    await db
      .update(emailMessages)
      .set({
        providerMessageId: caseExpression(
          providerIdEntries,
          emailMessages.providerMessageId,
        ),
        updatedAt: new Date(),
      })
      .where(inArray(emailMessages.id, messageIds));
  }
  if (providerStatusEntries.length > 0) {
    await db
      .update(emailMessages)
      .set({
        providerStatus: caseExpression(
          providerStatusEntries,
          emailMessages.providerStatus,
        ),
        updatedAt: new Date(),
      })
      .where(inArray(emailMessages.id, messageIds));
  }
}

export async function updateFailedEmailMessages(
  inserted: InsertedMessage[],
  recipients: string[],
  errorCode: string,
): Promise<void> {
  if (recipients.length === 0) return;
  const hashes = recipients.map(hashRecipient);
  const ids = inserted
    .filter((row) => hashes.includes(row.recipientHash))
    .map((row) => row.id);
  if (ids.length === 0) return;
  await db
    .update(emailMessages)
    .set({
      status: "failed",
      errorCode,
      errorMessage: "The provider did not accept this recipient.",
      updatedAt: new Date(),
    })
    .where(inArray(emailMessages.id, ids));
}

function caseExpression<T extends string | number>(
  entries: Array<{ id: string; value: T }>,
  fallback: unknown,
) {
  return sql`CASE ${emailMessages.id} ${sql.join(
    entries.map((entry) => sql`WHEN ${entry.id} THEN ${entry.value}`),
    sql.raw(" "),
  )} ELSE ${fallback} END`;
}